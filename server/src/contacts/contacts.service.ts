import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContactQueryDto, CreateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(createContactDto: CreateContactDto, tenantId: string) {
    if (createContactDto.companyId) {
      const company = await this.prisma.company.findFirst({
        where: { id: createContactDto.companyId, tenantId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    return this.prisma.contact.create({
      data: {
        ...createContactDto,
        tenantId,
      },
      include: {
        company: true,
        _count: {
          select: {
            deals: true,
            activities: true,
            notes: true,
          },
        },
      },
    });
  }

  async findAll(query: ContactQueryDto, tenantId: string) {
    const { search, status, companyId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              deals: true,
              activities: true,
              notes: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      data: contacts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
      include: {
        company: true,
        deals: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          include: {
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        notes: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            deals: true,
            activities: true,
            notes: true,
          },
        },
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async update(
    id: string,
    updateContactDto: CreateContactDto,
    tenantId: string,
  ) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (updateContactDto.companyId) {
      const company = await this.prisma.company.findFirst({
        where: { id: updateContactDto.companyId, tenantId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    return this.prisma.contact.update({
      where: { id },
      data: updateContactDto,
      include: {
        company: true,
        _count: {
          select: {
            deals: true,
            activities: true,
            notes: true,
          },
        },
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    await this.prisma.contact.delete({
      where: { id },
    });

    return { message: 'Contact deleted successfully' };
  }

  async getStats(tenantId: string) {
    const [total, active, prospects] = await Promise.all([
      this.prisma.contact.count({ where: { tenantId } }),
      this.prisma.contact.count({
        where: { tenantId, status: 'ACTIVE' },
      }),
      this.prisma.contact.count({
        where: { tenantId, status: 'PROSPECT' },
      }),
    ]);

    return {
      total,
      active,
      prospects,
      withoutCompany: await this.prisma.contact.count({
        where: { tenantId, companyId: null },
      }),
    };
  }
}
