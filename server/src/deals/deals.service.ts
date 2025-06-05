import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDealDto, DealQueryDto, UpdateDealDto } from './dto/deal.dto';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async create(createDealDto: CreateDealDto, tenantId: string) {
    const owner = await this.prisma.user.findFirst({
      where: { id: createDealDto.ownerId, tenantId },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    if (createDealDto.companyId) {
      const company = await this.prisma.company.findFirst({
        where: { id: createDealDto.companyId, tenantId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    if (createDealDto.contactId) {
      const contact = await this.prisma.contact.findFirst({
        where: { id: createDealDto.contactId, tenantId },
      });

      if (!contact) {
        throw new NotFoundException('Contact not found');
      }
    }

    return this.prisma.deal.create({
      data: {
        ...createDealDto,
        tenantId,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: {
            activities: true,
            notes: true,
          },
        },
      },
    });
  }

  async findAll(query: DealQueryDto, tenantId: string) {
    const {
      search,
      stage,
      status,
      ownerId,
      companyId,
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

    if (stage) {
      where.stage = stage;
    }

    if (status) {
      where.status = status;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: {
            select: { id: true, name: true },
          },
          contact: {
            select: { id: true, firstName: true, lastName: true },
          },
          owner: {
            select: { id: true, firstName: true, lastName: true },
          },
          _count: {
            select: {
              activities: true,
              notes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.deal.count({ where }),
    ]);

    return {
      data: deals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, tenantId },
      include: {
        company: true,
        contact: true,
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            assignedTo: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        _count: {
          select: {
            activities: true,
            notes: true,
          },
        },
      },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async update(id: string, updateDealDto: UpdateDealDto, tenantId: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, tenantId },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    if (updateDealDto.ownerId) {
      const owner = await this.prisma.user.findFirst({
        where: { id: updateDealDto.ownerId, tenantId },
      });

      if (!owner) {
        throw new NotFoundException('Owner not found');
      }
    }

    if (updateDealDto.companyId) {
      const company = await this.prisma.company.findFirst({
        where: { id: updateDealDto.companyId, tenantId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    if (updateDealDto.contactId) {
      const contact = await this.prisma.contact.findFirst({
        where: { id: updateDealDto.contactId, tenantId },
      });

      if (!contact) {
        throw new NotFoundException('Contact not found');
      }
    }

    return this.prisma.deal.update({
      where: { id },
      data: updateDealDto,
      include: {
        company: {
          select: { id: true, name: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: {
            activities: true,
            notes: true,
          },
        },
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, tenantId },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    await this.prisma.deal.delete({
      where: { id },
    });

    return { message: 'Deal deleted successfully' };
  }

  async getStats(tenantId: string) {
    const [total, open, won, lost, byStage, totalValue, avgValue] =
      await Promise.all([
        this.prisma.deal.count({ where: { tenantId } }),
        this.prisma.deal.count({ where: { tenantId, status: 'OPEN' } }),
        this.prisma.deal.count({ where: { tenantId, status: 'WON' } }),
        this.prisma.deal.count({ where: { tenantId, status: 'LOST' } }),
        this.prisma.deal.groupBy({
          by: ['stage'],
          where: { tenantId },
          _count: true,
          _sum: { value: true },
        }),
        this.prisma.deal.aggregate({
          _sum: { value: true },
          where: { tenantId },
        }),
        this.prisma.deal.aggregate({
          _avg: { value: true },
          where: { tenantId },
        }),
      ]);

    return {
      total,
      open,
      won,
      lost,
      byStage: byStage.reduce(
        (acc, item) => {
          acc[item.stage] = {
            count: item._count,
            value: item._sum.value || 0,
          };
          return acc;
        },
        {} as Record<string, { count: number; value: number }>,
      ),
      totalValue: totalValue._sum.value || 0,
      avgValue: avgValue._avg.value || 0,
    };
  }

  async getPipeline(tenantId: string) {
    return this.prisma.deal.groupBy({
      by: ['stage'],
      where: { tenantId, status: 'OPEN' },
      _count: true,
      _sum: { value: true },
      orderBy: {
        stage: 'asc',
      },
    });
  }
}
