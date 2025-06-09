import { faker } from '@faker-js/faker';
import { PrismaClient, ActivityType, ActivityStatus } from '@prisma/client';

export interface CreateActivityData {
  title?: string;
  description?: string;
  type?: ActivityType;
  status?: ActivityStatus;
  dueDate?: Date;
  completedAt?: Date;
  tenantId: string;
  assignedToId: string;
  companyId?: string;
  contactId?: string;
  dealId?: string;
}

export const createActivityFactory = (prisma: PrismaClient) => {
  return async (data: CreateActivityData) => {
    const type =
      data.type ||
      faker.helpers.arrayElement(['CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE']);

    return await prisma.activity.create({
      data: {
        title: data.title || getActivityTitle(type),
        description: data.description || faker.lorem.sentence(),
        type,
        status:
          data.status ||
          faker.helpers.arrayElement([
            'PLANNED',
            'IN_PROGRESS',
            'COMPLETED',
            'CANCELLED',
          ]),
        dueDate:
          data.dueDate || faker.date.future({ years: 1, refDate: new Date() }),
        completedAt: data.completedAt,
        tenantId: data.tenantId,
        assignedToId: data.assignedToId,
        companyId: data.companyId,
        contactId: data.contactId,
        dealId: data.dealId,
      },
    });
  };
};

function getActivityTitle(type: string): string {
  const titles: Record<string, string[]> = {
    CALL: ['Follow-up call', 'Discovery call', 'Demo call', 'Check-in call'],
    EMAIL: ['Send proposal', 'Follow-up email', 'Introduction email'],
    MEETING: ['Kickoff meeting', 'Review meeting', 'Planning session'],
    TASK: ['Prepare proposal', 'Research company', 'Update CRM'],
    NOTE: ['Meeting notes', 'Call summary', 'Important update'],
  };
  return faker.helpers.arrayElement(titles[type] || ['Generic activity']);
}
