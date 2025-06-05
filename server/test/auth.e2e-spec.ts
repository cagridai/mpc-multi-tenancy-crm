import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestHelper } from './test-utils';

describe('Authentication (e2e)', () => {
  let testHelper: TestHelper;
  let app: INestApplication;

  beforeAll(async () => {
    testHelper = new TestHelper();
    await testHelper.setupTestApp();
    app = testHelper.app;
  });

  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  afterAll(async () => {
    await testHelper.teardown();
  });

  describe('POST /auth/create-tenant', () => {
    it('should create a new tenant and admin user', async () => {
      const createTenantDto = {
        name: 'Test Company',
        subdomain: 'testcompany',
        adminEmail: 'admin@testcompany.com',
        adminPassword: 'password123',
        adminFirstName: 'Admin',
        adminLastName: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/create-tenant')
        .send(createTenantDto)
        .expect(201);

      expect(response.body).toMatchObject({
        access_token: expect.any(String),
        user: {
          id: expect.any(String),
          email: createTenantDto.adminEmail,
          firstName: createTenantDto.adminFirstName,
          lastName: createTenantDto.adminLastName,
          role: 'ADMIN',
          tenant: {
            id: expect.any(String),
            name: createTenantDto.name,
            subdomain: createTenantDto.subdomain,
          },
        },
      });
    });

    it('should fail with duplicate subdomain', async () => {
      // Create first tenant
      const tenant = await testHelper.createTestTenant('duplicate');

      const createTenantDto = {
        name: 'Another Company',
        subdomain: 'duplicate',
        adminEmail: 'admin@another.com',
        adminPassword: 'password123',
        adminFirstName: 'Admin',
        adminLastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/auth/create-tenant')
        .send(createTenantDto)
        .expect(409);
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        name: '',
        subdomain: '',
        adminEmail: 'invalid-email',
        adminPassword: '123', // Too short
      };

      await request(app.getHttpServer())
        .post('/auth/create-tenant')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const tenant = await testHelper.createTestTenant();
      const user = await testHelper.createTestUser(tenant.id, 'user@test.com');

      const loginDto = {
        email: 'user@test.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .set('x-tenant-id', tenant.id)
        .send(loginDto)
        .expect(201);

      expect(response.body).toMatchObject({
        access_token: expect.any(String),
        user: {
          id: user.id,
          email: user.email,
          role: 'USER',
        },
      });
    });

    it('should fail with invalid credentials', async () => {
      const tenant = await testHelper.createTestTenant();
      await testHelper.createTestUser(tenant.id, 'user@test.com');

      const loginDto = {
        email: 'user@test.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .set('x-tenant-id', tenant.id)
        .send(loginDto)
        .expect(401);
    });

    it('should fail without tenant header', async () => {
      const loginDto = {
        email: 'user@test.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(404); // Tenant not found
    });

    it('should not allow cross-tenant login', async () => {
      const tenant1 = await testHelper.createTestTenant('tenant1');
      const tenant2 = await testHelper.createTestTenant('tenant2');

      await testHelper.createTestUser(tenant1.id, 'user@tenant1.com');

      const loginDto = {
        email: 'user@tenant1.com',
        password: 'password123',
      };

      // Try to login to tenant1 user using tenant2 context
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('x-tenant-id', tenant2.id)
        .send(loginDto)
        .expect(401);
    });
  });

  describe('POST /auth/register', () => {
    it('should register a new user in existing tenant', async () => {
      const tenant = await testHelper.createTestTenant();

      const registerDto = {
        email: 'newuser@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        tenantId: tenant.id,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .set('x-tenant-id', tenant.id)
        .send(registerDto)
        .expect(201);

      expect(response.body).toMatchObject({
        access_token: expect.any(String),
        user: {
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          role: 'USER',
        },
      });
    });

    it('should fail with invalid tenant', async () => {
      const registerDto = {
        email: 'newuser@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        tenantId: 'invalid-tenant-id',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .set('x-tenant-id', 'invalid-tenant-id')
        .send(registerDto)
        .expect(404);
    });
  });
});
