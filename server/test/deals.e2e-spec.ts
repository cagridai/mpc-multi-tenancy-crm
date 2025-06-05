import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestHelper, TestUser, TestTenant } from './test-utils';

describe('Deals (e2e)', () => {
  let testHelper: TestHelper;
  let app: INestApplication;
  let tenant1: TestTenant;
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
    user1 = await testHelper.createTestUser(tenant1.id, 'user1@tenant1.com');
    user2 = await testHelper.createTestUser(tenant1.id, 'user2@tenant1.com');
  });

  afterAll(async () => {
    await testHelper.teardown();
  });

  describe('POST /deals', () => {
    it('should create a deal', async () => {
      const createDealDto = {
        title: 'Test Deal',
        value: 50000,
        currency: 'USD',
        stage: 'PROSPECTING',
        status: 'OPEN',
        probability: 50,
        ownerId: user1.id,
      };

      const response = await request(app.getHttpServer())
        .post('/deals')
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .send(createDealDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: createDealDto.title,
        value: createDealDto.value,
        tenantId: tenant1.id,
        owner: {
          id: user1.id,
        },
      });
    });

    it('should not allow creating deal with owner from different tenant', async () => {
      const tenant2 = await testHelper.createTestTenant('tenant2');
      const otherUser = await testHelper.createTestUser(
        tenant2.id,
        'other@tenant2.com',
      );

      const createDealDto = {
        title: 'Test Deal',
        ownerId: otherUser.id, // User from different tenant
      };

      await request(app.getHttpServer())
        .post('/deals')
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .send(createDealDto)
        .expect(404);
    });

    it('should create deal with company and contact associations', async () => {
      const company = await testHelper.createTestCompany(tenant1.id);
      const contact = await testHelper.createTestContact(
        tenant1.id,
        company.id,
      );

      const createDealDto = {
        title: 'Associated Deal',
        ownerId: user1.id,
        companyId: company.id,
        contactId: contact.id,
      };

      const response = await request(app.getHttpServer())
        .post('/deals')
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .send(createDealDto)
        .expect(201);

      expect(response.body.company.id).toBe(company.id);
      expect(response.body.contact.id).toBe(contact.id);
    });
  });

  describe('GET /deals', () => {
    beforeEach(async () => {
      // Create test deals
      await testHelper.createTestDeal(tenant1.id, user1.id);
      await testHelper.createTestDeal(tenant1.id, user2.id);
    });

    it('should return all deals for tenant', async () => {
      const response = await request(app.getHttpServer())
        .get('/deals')
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(
        response.body.data.every((deal) => deal.tenantId === tenant1.id),
      ).toBe(true);
    });

    it('should filter deals by owner', async () => {
      const response = await request(app.getHttpServer())
        .get(`/deals?ownerId=${user1.id}`)
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].owner.id).toBe(user1.id);
    });

    it('should filter deals by stage', async () => {
      // Create a deal with specific stage
      await testHelper.prisma.deal.create({
        data: {
          title: 'Proposal Deal',
          stage: 'PROPOSAL',
          ownerId: user1.id,
          tenantId: tenant1.id,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/deals?stage=PROPOSAL')
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].stage).toBe('PROPOSAL');
    });
  });

  describe('GET /deals/stats', () => {
    beforeEach(async () => {
      // Create deals with different statuses
      await testHelper.prisma.deal.createMany({
        data: [
          {
            title: 'Open Deal 1',
            status: 'OPEN',
            stage: 'PROSPECTING',
            value: 10000,
            ownerId: user1.id,
            tenantId: tenant1.id,
          },
          {
            title: 'Open Deal 2',
            status: 'OPEN',
            stage: 'PROPOSAL',
            value: 20000,
            ownerId: user1.id,
            tenantId: tenant1.id,
          },
          {
            title: 'Won Deal',
            status: 'WON',
            stage: 'CLOSED_WON',
            value: 30000,
            ownerId: user1.id,
            tenantId: tenant1.id,
          },
        ],
      });
    });

    it('should return tenant-specific deal statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/deals/stats')
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .expect(200);

      expect(response.body).toMatchObject({
        total: 3,
        open: 2,
        won: 1,
        lost: 0,
        totalValue: 60000,
        avgValue: 20000,
      });
    });
  });

  describe('GET /deals/pipeline', () => {
    beforeEach(async () => {
      await testHelper.prisma.deal.createMany({
        data: [
          {
            title: 'Prospecting Deal',
            status: 'OPEN',
            stage: 'PROSPECTING',
            value: 10000,
            ownerId: user1.id,
            tenantId: tenant1.id,
          },
          {
            title: 'Proposal Deal',
            status: 'OPEN',
            stage: 'PROPOSAL',
            value: 20000,
            ownerId: user1.id,
            tenantId: tenant1.id,
          },
          {
            title: 'Closed Deal',
            status: 'WON',
            stage: 'CLOSED_WON',
            value: 30000,
            ownerId: user1.id,
            tenantId: tenant1.id,
          },
        ],
      });
    });

    it('should return pipeline data for open deals only', async () => {
      const response = await request(app.getHttpServer())
        .get('/deals/pipeline')
        .set('Authorization', `Bearer ${user1.token}`)
        .set('x-tenant-id', tenant1.id)
        .expect(200);

      expect(response.body).toHaveLength(2); // Only open deals
      expect(response.body.every((stage) => stage._count > 0)).toBe(true);
    });
  });
});
