import { faker } from '@faker-js/faker';
import { PrismaClient, CompanySize, CompanyStatus } from '@prisma/client';

export interface CreateCompanyData {
  name?: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  size?: CompanySize;
  status?: CompanyStatus;
  description?: string;
  tenantId: string;
}

export const createCompanyFactory = (prisma: PrismaClient) => {
  return async (data: CreateCompanyData) => {
    const companyName = data.name || faker.company.name();

    return await prisma.company.create({
      data: {
        name: companyName,
        industry: data.industry || faker.company.buzzNoun(),
        website: data.website || faker.internet.url(),
        phone: data.phone || faker.phone.number(),
        email: data.email || faker.internet.email(),
        address: data.address || faker.location.streetAddress(true),
        size:
          data.size ||
          faker.helpers.arrayElement([
            'STARTUP',
            'SMALL',
            'MEDIUM',
            'LARGE',
            'ENTERPRISE',
          ]),
        status:
          data.status ||
          faker.helpers.arrayElement(['ACTIVE', 'INACTIVE', 'PROSPECT']),
        description: data.description || faker.lorem.paragraph(),
        tenantId: data.tenantId,
      },
    });
  };
};
