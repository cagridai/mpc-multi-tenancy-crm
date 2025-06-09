import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

export interface CreateNoteData {
  content?: string;
  tenantId: string;
  authorId: string;
  companyId?: string;
  contactId?: string;
  dealId?: string;
}

export const createNoteFactory = (prisma: PrismaClient) => {
  return async (data: CreateNoteData) => {
    return await prisma.note.create({
      data: {
        content: data.content || faker.lorem.paragraphs(2),
        tenantId: data.tenantId,
        authorId: data.authorId,
        companyId: data.companyId,
        contactId: data.contactId,
        dealId: data.dealId,
      },
    });
  };
};
