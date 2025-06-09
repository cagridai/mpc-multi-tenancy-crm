import { faker } from '@faker-js/faker';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

export interface CreateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  tenantId: string;
  isAdmin?: boolean;
}

export const createUserFactory = (prisma: PrismaClient) => {
  return async (data: CreateUserData) => {
    const firstName = data.firstName || faker.person.firstName();
    const lastName = data.lastName || faker.person.lastName();
    const hashedPassword = await bcrypt.hash('password123', 10);

    return await prisma.user.create({
      data: {
        email: data.email || faker.internet.email({ firstName, lastName }),
        password: hashedPassword,
        firstName,
        lastName,
        role: data.isAdmin
          ? 'ADMIN'
          : data.role || faker.helpers.arrayElement(['MANAGER', 'USER']),
        isActive: data.isActive ?? true,
        tenantId: data.tenantId,
      },
    });
  };
};
