import { faker } from '@faker-js/faker';
import { PrismaClient, ContactStatus } from '@prisma/client';

export interface CreateContactData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  status?: ContactStatus;
  tenantId: string;
  companyId?: string;
}

export const createContactFactory = (prisma: PrismaClient) => {
  return async (data: CreateContactData) => {
    const firstName = data.firstName || faker.person.firstName();
    const lastName = data.lastName || faker.person.lastName();

    return await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email: data.email || faker.internet.email({ firstName, lastName }),
        phone: data.phone || faker.phone.number(),
        position: data.position || faker.person.jobTitle(),
        status:
          data.status ||
          faker.helpers.arrayElement(['ACTIVE', 'INACTIVE', 'PROSPECT']),
        tenantId: data.tenantId,
        companyId: data.companyId,
      },
    });
  };
};
