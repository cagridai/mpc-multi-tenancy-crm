/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNoteDto, NoteQueryDto, UpdateNoteDto } from './dto/note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createNoteDto: CreateNoteDto,
    authorId: string,
    tenantId: string,
  ) {
    if (createNoteDto.companyId) {
      const company = await this.prisma.company.findFirst({
        where: { id: createNoteDto.companyId, tenantId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    if (createNoteDto.contactId) {
      const contact = await this.prisma.contact.findFirst({
        where: { id: createNoteDto.contactId, tenantId },
      });

      if (!contact) {
        throw new NotFoundException('Contact not found');
      }
    }

    if (createNoteDto.dealId) {
      const deal = await this.prisma.deal.findFirst({
        where: { id: createNoteDto.dealId, tenantId },
      });

      if (!deal) {
        throw new NotFoundException('Deal not found');
      }
    }

    return this.prisma.note.create({
      data: {
        ...createNoteDto,
        authorId,
        tenantId,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        company: {
          select: { id: true, name: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
        deal: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async findAll(query: NoteQueryDto, tenantId: string) {
    const {
      search,
      authorId,
      companyId,
      contactId,
      dealId,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (search) {
      where.content = { contains: search, mode: 'insensitive' };
    }

    if (authorId) {
      where.authorId = authorId;
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

    const [notes, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true },
          },
          company: {
            select: { id: true, name: true },
          },
          contact: {
            select: { id: true, firstName: true, lastName: true },
          },
          deal: {
            select: { id: true, title: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.note.count({ where }),
    ]);

    return {
      data: notes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, tenantId },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        company: true,
        contact: true,
        deal: true,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(
    id: string,
    updateNoteDto: UpdateNoteDto,
    userId: string,
    tenantId: string,
  ) {
    const note = await this.prisma.note.findFirst({
      where: { id, tenantId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.authorId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this note',
      );
    }

    return this.prisma.note.update({
      where: { id },
      data: updateNoteDto,
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
        company: {
          select: { id: true, name: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
        deal: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async remove(id: string, userId: string, tenantId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, tenantId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.authorId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this note',
      );
    }

    await this.prisma.note.delete({
      where: { id },
    });

    return { message: 'Note deleted successfully' };
  }

  async getStats(tenantId: string, userId?: string) {
    const where: any = { tenantId };
    if (userId) {
      where.authorId = userId;
    }

    const [total, recentCount, byEntity] = await Promise.all([
      this.prisma.note.count({ where }),
      this.prisma.note.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
          },
        },
      }),
      Promise.all([
        this.prisma.note.count({
          where: { ...where, companyId: { not: null } },
        }),
        this.prisma.note.count({
          where: { ...where, contactId: { not: null } },
        }),
        this.prisma.note.count({
          where: { ...where, dealId: { not: null } },
        }),
      ]),
    ]);

    let unattached = 0;
    if (total - (byEntity[0] + byEntity[1] + byEntity[2]) > 0) {
      unattached = total - (byEntity[0] + byEntity[1] + byEntity[2]);
    } else {
      unattached = 0;
    }

    return {
      total,
      recentCount,
      byEntity: {
        companies: byEntity[0],
        contacts: byEntity[1],
        deals: byEntity[2],
        unattached,
      },
    };
  }
}
