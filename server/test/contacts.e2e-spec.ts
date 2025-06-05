import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestHelper, TestUser, TestTenant } from './test-utils';

describe('Contacts (e2e)', () => {
  let testHelper: TestHelper;
  let app: INestApplication;
  let tenant1: TestTenant;
  let tenant2: TestTenant;
  let user1: TestUser;
  let user2: TestUser;

  beforeAll(async () => {
    testHelper = new TestHelper();
    await testHelper.setupTestApp();
    app = testHelper.app;
  });

  beforeEach(async () => {
    await testHelper.cleanDatabase();

    tenant1 = await testHelper.createTestTenant('tenant1');
    tenant2 = await testHelper.createTestTenant('tenant2');
    user1 = await testHelper.createTestUser(tenant1.id, 'user1@tenant1.com');
    user2 = await testHelper.createTestUser(tenant2.id, 'user2@tenant2.com');
  });

  afterAll(async () => {
    await testHelper.teardown();
  });

  describe('POST /contacts', () => {
    it('should create a contact', async () => {
      const createContactDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        position: 'CEO',
        status: 'ACTIVE',
      };

      const response = await request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .send(createContactDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        firstName: createContactDto.firstName,
        lastName: createContactDto.lastName,
        email: createContactDto.email,
        tenantId: tenant1.id,
      });
    });

    it('should create a contact with company association', async () => {
      const company = await testHelper.createTestCompany(tenant1.id);

      const createContactDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        companyId: company.id,
      };

      const response = await request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .send(createContactDto)
        .expect(201);

      expect(response.body.company.id).toBe(company.id);
    });

    it('should not allow associating with companies from other tenants', async () => {
      const company = await testHelper.createTestCompany(tenant2.id);

      const createContactDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        companyId: company.id,
      };

      await request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .send(createContactDto)
        .expect(404);
    });
  });

  describe('GET /contacts', () => {
    it('should return tenant-isolated contacts', async () => {
      const contact1 = await testHelper.createTestContact(
        tenant1.id,
        undefined,
        'John',
        'Tenant1',
      );
      const contact2 = await testHelper.createTestContact(
        tenant2.id,
        undefined,
        'Jane',
        'Tenant2',
      );

      // User 1 should only see tenant 1 contacts
      const response1 = await request(app.getHttpServer())
        .get('/contacts')
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .expect(200);

      expect(response1.body.data).toHaveLength(1);
      expect(response1.body.data[0].firstName).toBe('John');

      // User 2 should only see tenant 2 contacts
      const response2 = await request(app.getHttpServer())
        .get('/contacts')
        .set('Authorization', `Bearer ${user2.token}`)
        .set('x-tenant-id', tenant2.id)
        .expect(200);

      expect(response2.body.data).toHaveLength(1);
      expect(response2.body.data[0].firstName).toBe('Jane');
    });

    it('should support filtering by company', async () => {
      const company = await testHelper.createTestCompany(tenant1.id);
      const contact1 = await testHelper.createTestContact(
        tenant1.id,
        company.id,
        'John',
        'WithCompany',
      );
      const contact2 = await testHelper.createTestContact(
        tenant1.id,
        undefined,
        'Jane',
        'WithoutCompany',
      );

      const response = await request(app.getHttpServer())
        .get(`/contacts?companyId=${company.id}`)
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].firstName).toBe('John');
    });

    it('should support search functionality', async () => {
      await testHelper.createTestContact(
        tenant1.id,
        undefined,
        'John',
        'Searchable',
      );
      await testHelper.createTestContact(
        tenant1.id,
        undefined,
        'Jane',
        'Different',
      );

      const response = await request(app.getHttpServer())
        .get('/contacts?search=Searchable')
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].lastName).toBe('Searchable');
    });
  });

  describe('Tenant isolation tests', () => {
    it('should not allow access to contacts from other tenants', async () => {
      const contact = await testHelper.createTestContact(tenant2.id);

      await request(app.getHttpServer())
        .get(`/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .expect(404);
    });

    it('should not allow updating contacts from other tenants', async () => {
      const contact = await testHelper.createTestContact(tenant2.id);

      await request(app.getHttpServer())
        .patch(`/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .send({ firstName: 'Hacked' })
        .expect(404);
    });

    it('should not allow deleting contacts from other tenants', async () => {
      const contact = await testHelper.createTestContact(tenant2.id);

      await request(app.getHttpServer())
        .delete(`/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .expect(404);
    });
  });
});
