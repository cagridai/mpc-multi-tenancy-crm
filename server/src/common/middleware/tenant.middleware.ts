import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Response, res: Response, next: NextFunction) {
    const tenantHeader = req.headers['x-tenant-id'] as string;
    const subdomainHeader = req.headers['x-tenant-subdomain'] as string;

    if (!tenantHeader && !subdomainHeader) {
      throw new NotFoundException('Tenant identifier is required');
    }

    try {
      const tenant = await this.prisma.tenant.findFirst({
        where: tenantHeader
          ? { id: tenantHeader }
          : { subdomain: subdomainHeader },
      });

      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      if (!tenant.isActive) {
        throw new NotFoundException('Tenant is not active');
      }

      (req as any).tenant = tenant;
      next();
    } catch (error) {
      throw new NotFoundException('Invalid tenant');
    }
  }
}
