import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

export interface CreateTenantData {
  name?: string;
  subdomain?: string;
  plan?: string;
  isActive?: boolean;
}

export const createTenantFactory = (prisma: PrismaClient) => {
  return async (data: CreateTenantData = {}) => {
    const companyName = data.name || faker.company.name();
    const subdomain =
      data.subdomain ||
      companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 10) + faker.number.int({ min: 10, max: 999 });

    return await prisma.tenant.create({
      data: {
        name: companyName,
        subdomain,
        plan:
          data.plan ||
          faker.helpers.arrayElement(['free', 'pro', 'enterprise']),
        isActive: data.isActive ?? true,
      },
    });
  };
};
