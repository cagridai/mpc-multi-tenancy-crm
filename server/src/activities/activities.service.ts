import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ActivityQueryDto,
  CreateActivityDto,
  UpdateActivityDto,
} from './dto/activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(createActivityDto: CreateActivityDto, tenantId: string) {
    const assignedUser = await this.prisma.user.findFirst({
      where: { id: createActivityDto.assignedToId, tenantId },
    });

    if (!assignedUser) {
      throw new NotFoundException('Assigned user not found!');
    }

    if (createActivityDto.companyId) {
      const company = await this.prisma.company.findFirst({
        where: { id: createActivityDto.companyId, tenantId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    if (createActivityDto.contactId) {
      const contact = await this.prisma.contact.findFirst({
        where: { id: createActivityDto.contactId, tenantId },
      });

      if (!contact) {
        throw new NotFoundException('Contact not found');
      }
    }

    if (createActivityDto.dealId) {
      const deal = await this.prisma.deal.findFirst({
        where: { id: createActivityDto.dealId, tenantId },
      });

      if (!deal) {
        throw new NotFoundException('Deal not found');
      }
    }

    return this.prisma.activity.create({
      data: {
        ...createActivityDto,
        tenantId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findAll(query: ActivityQueryDto, tenantId: string) {
    const {
      search,
      type,
      status,
      assignedToId,
      companyId,
      contactId,
      dealId,
      overdue,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (dealId) {
      where.dealId = dealId;
    }

    if (overdue) {
      where.dueDate = {
        lt: new Date(),
      };

      where.status = {
        in: ['PLANNED', 'IN_PROGRESS'],
      };
    }

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          deal: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.activity.count({ where }),
    ]);

    return {
      data: activities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, tenantId },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        company: true,
        contact: true,
        deal: true,
      },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }

  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
    tenantId: string,
  ) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, tenantId },
    });

    if (updateActivityDto.assignedToId) {
      const assignedUser = await this.prisma.user.findFirst({
        where: { id: updateActivityDto.assignedToId, tenantId },
      });

      if (!assignedUser) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    const updateData: any = {
      ...updateActivityDto,
    };

    if (
      updateActivityDto.status === 'COMPLETED' &&
      activity &&
      activity.status !== 'COMPLETED'
    ) {
      updateData.completedAt = new Date();
    } else if (updateActivityDto.status !== 'COMPLETED') {
      updateData.completedAt = null;
    }

    return this.prisma.activity.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, tenantId },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    await this.prisma.activity.delete({
      where: { id },
    });

    return { message: 'Activity deleted successfully' };
  }

  async getStats(tenantId: string, userId?: string) {
    const where: any = { tenantId };
    if (userId) {
      where.assignedToId = userId;
    }

    const [total, planned, inProgress, completed, overdue, byType] =
      await Promise.all([
        this.prisma.activity.count({ where }),
        this.prisma.activity.count({
          where: { ...where, status: 'PLANNED' },
        }),
        this.prisma.activity.count({
          where: { ...where, status: 'IN_PROGRESS' },
        }),
        this.prisma.activity.count({
          where: { ...where, status: 'COMPLETED' },
        }),
        this.prisma.activity.count({
          where: {
            ...where,
            dueDate: { lt: new Date() },
            status: { in: ['PLANNED', 'IN_PROGRESS'] },
          },
        }),
        this.prisma.activity.groupBy({
          by: ['type'],
          _count: true,
          where,
        }),
      ]);

    return {
      total,
      planned,
      inProgress,
      completed,
      overdue,
      byType: byType.reduce(
        (acc, item) => {
          acc[item.type] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  async getUpcoming(tenantId: string, userId?: string, days: number = 7) {
    const where: any = {
      tenantId,
      dueDate: {
        gte: new Date(),
        lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      },
      status: { in: ['PLANNED', 'IN_PROGRESS'] },
    };

    if (userId) {
      where.assignedToId = userId;
    }

    return this.prisma.activity.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
    });
  }
}
