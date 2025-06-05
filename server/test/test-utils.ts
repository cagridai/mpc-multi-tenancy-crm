/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface TestUser {
  id: string;
  email: string;
  tenantId: string;
  token: string;
}

export interface TestTenant {
  id: string;
  name: string;
  subdomain: string;
}

export class TestHelper {
  public app: INestApplication;
  public prisma: PrismaService;

  async setupTestApp(): Promise<void> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    this.prisma = this.app.get<PrismaService>(PrismaService);
    await this.app.init();
  }

  async cleanDatabase(): Promise<void> {
    await this.prisma.note.deleteMany();
    await this.prisma.activity.deleteMany();
    await this.prisma.deal.deleteMany();
    await this.prisma.contact.deleteMany();
    await this.prisma.company.deleteMany();
    await this.prisma.user.deleteMany();
    await this.prisma.tenant.deleteMany();
  }

  async createTestTenant(subdomain: string = 'testcorp'): Promise<TestTenant> {
    const tenant = await this.prisma.tenant.create({
      data: {
        name: `Test Corp ${subdomain}`,
        subdomain,
        plan: 'pro',
      },
    });

    return {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
    };
  }

  async createTestUser(
    tenantId: string,
    email: string = 'test@example.com',
    role: 'ADMIN' | 'MANAGER' | 'USER' = 'USER',
  ): Promise<TestUser> {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role,
        tenantId,
      },
    });

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { email: user.email, sub: user.id, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      },
    );

    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      token,
    };
  }

  async createTestCompany(tenantId: string, name: string = 'Test Company') {
    return this.prisma.company.create({
      data: {
        name,
        industry: 'Technology',
        email: 'info@testcompany.com',
        status: 'ACTIVE',
        tenantId,
      },
    });
  }

  async createTestContact(
    tenantId: string,
    companyId?: string,
    firstName: string = 'John',
    lastName: string = 'Doe',
  ) {
    return this.prisma.contact.create({
      data: {
        firstName,
        lastName,
        email: 'jhon.doe@example.com',
        status: 'ACTIVE',
        companyId,
        tenantId,
      },
    });
  }

  async createTestDeal(
    tenantId: string,
    ownerId: string,
    companyId?: string,
    contactId?: string,
  ) {
    return this.prisma.deal.create({
      data: {
        title: 'Test Deal',
        value: 1000,
        stage: 'PROSPECTING',
        status: 'OPEN',
        ownerId,
        companyId,
        contactId,
        tenantId,
      },
    });
  }

  async teardown(): Promise<void> {
    await this.cleanDatabase();
    await this.app.close();
  }
}
