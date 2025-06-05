import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CompanyQueryDto,
  CreateCompanyDto,
  UpdateCompanyDto,
} from './dto/company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto, tenantId: string) {
    return this.prisma.company.create({
      data: {
        ...createCompanyDto,
        tenantId,
      },
      include: {
        contacts: true,
        deals: true,
        _count: {
          select: {
            contacts: true,
            deals: true,
            activities: true,
          },
        },
      },
    });
  }

  async findAll(query: CompanyQueryDto, tenantId: string) {
    const { search, status, size, industry, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (size) {
      where.size = size;
    }

    if (industry) {
      where.industry = industry;
    }

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              contacts: true,
              deals: true,
              activities: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, tenantId },
      include: {
        contacts: {
          orderBy: { createdAt: 'desc' },
        },
        deals: {
          orderBy: { createdAt: 'desc' },
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
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    tenantId: string,
  ) {
    const company = await this.prisma.company.findFirst({
      where: { id, tenantId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
      include: {
        _count: {
          select: {
            contacts: true,
            deals: true,
            activities: true,
          },
        },
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, tenantId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    await this.prisma.company.delete({
      where: { id },
    });

    return { message: 'Company deleted successfully' };
  }

  async getStats(tenantId: string) {
    const [total, active, prospects, bySize] = await Promise.all([
      this.prisma.company.count({
        where: { tenantId },
      }),
      this.prisma.company.count({
        where: { tenantId, status: 'ACTIVE' },
      }),
      this.prisma.company.count({
        where: { tenantId, status: 'PROSPECT' },
      }),
      this.prisma.company.groupBy({
        by: ['size'],
        where: { tenantId },
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      prospects,
      bySize: bySize.reduce(
        (acc, item) => {
          acc[item.size || 'UNKNOWN'] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}
