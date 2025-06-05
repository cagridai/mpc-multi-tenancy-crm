import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTenantDto, LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: loginDto.email,
      },
      include: {
        tenant: true,
      },
    });

    if (!user || !user.isActive || !user.tenant.isActive) {
      throw new Error('Invalid credentials or inactive user/tenant');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      tenantId: user.tenant.id,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '1h', // Use config service
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenant: user.tenant,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: registerDto.email, tenantId: registerDto.tenantId },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: registerDto.tenantId },
    });

    if (!tenant || !tenant.isActive) {
      throw new UnauthorizedException('Invalid tenant');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        tenantId: registerDto.tenantId,
      },
      include: {
        tenant: true,
      },
    });
    const payload = {
      email: user.email,
      sub: user.id,
      tenantId: user.tenantId,
    };
    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '1h', // Use config service
    });
    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenant: user.tenant,
      },
    };
  }

  async createTenant(createTenantDto: CreateTenantDto) {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain: createTenantDto.subdomain },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant with this subdomain already exists');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { email: createTenantDto.adminEmail },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createTenantDto.adminPassword, 10);

    const result = await this.prisma.$transaction(async (prisma) => {
      const tenant = await prisma.tenant.create({
        data: {
          name: createTenantDto.name,
          subdomain: createTenantDto.subdomain,
          plan: createTenantDto.plan || 'free',
        },
      });

      const adminUser = await prisma.user.create({
        data: {
          email: createTenantDto.adminEmail,
          password: hashedPassword,
          firstName: createTenantDto.adminFirstName,
          lastName: createTenantDto.adminLastName,
          role: 'ADMIN',
          tenantId: tenant.id,
        },
        include: {
          tenant: true,
        },
      });
      return { tenant, adminUser };
    });

    const payload = {
      email: result.adminUser.email,
      sub: result.adminUser.id,
      tenantId: result.tenant.id,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '1h', // Use config service
    });

    return {
      access_token: token,
      user: {
        id: result.adminUser.id,
        email: result.adminUser.email,
        firstName: result.adminUser.firstName,
        lastName: result.adminUser.lastName,
        role: result.adminUser.role,
        tenant: result.tenant,
      },
    };
  }
}
