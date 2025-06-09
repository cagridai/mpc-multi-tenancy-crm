import { faker } from '@faker-js/faker';
import { PrismaClient, DealStage, DealStatus } from '@prisma/client';

export interface CreateDealData {
  title?: string;
  value?: number;
  currency?: string;
  stage?: DealStage;
  status?: DealStatus;
  probability?: number;
  closeDate?: Date;
  tenantId: string;
  ownerId: string;
  companyId?: string;
  contactId?: string;
}

export const createDealFactory = (prisma: PrismaClient) => {
  return async (data: CreateDealData) => {
    const stage =
      data.stage ||
      faker.helpers.arrayElement([
        'PROSPECTING',
        'QUALIFICATION',
        'PROPOSAL',
        'NEGOTIATION',
        'CLOSED_WON',
        'CLOSED_LOST',
      ]);

    const probability = data.probability ?? getDefaultProbability(stage);

    return await prisma.deal.create({
      data: {
        title: data.title || faker.commerce.productName() + ' Deal',
        value: data.value || faker.number.float({ min: 1000, max: 100000 }),
        currency: data.currency || 'USD',
        stage,
        status:
          data.status || faker.helpers.arrayElement(['OPEN', 'WON', 'LOST']),
        probability,
        closeDate:
          data.closeDate ||
          faker.date.future({ years: 1, refDate: new Date() }),
        tenantId: data.tenantId,
        ownerId: data.ownerId,
        companyId: data.companyId,
        contactId: data.contactId,
      },
    });
  };
};

function getDefaultProbability(stage: string): number {
  const probabilityMap: Record<string, number> = {
    PROSPECTING: 10,
    QUALIFICATION: 25,
    PROPOSAL: 50,
    NEGOTIATION: 75,
    CLOSED_WON: 100,
    CLOSED_LOST: 0,
  };
  return probabilityMap[stage] || 50;
}
