import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'tenant_123' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;
}

export class CreateTenantDto {
  @ApiProperty({ example: 'Acme Inc.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'acme' })
  @IsString()
  @IsNotEmpty()
  subdomain: string;

  @ApiProperty({ example: 'admin@acme.com' })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({ example: 'adminpassword', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  adminPassword: string;

  @ApiProperty({ example: 'Alice' })
  @IsString()
  @IsNotEmpty()
  adminFirstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  adminLastName: string;

  @ApiPropertyOptional({ example: 'pro' })
  @IsString()
  @IsNotEmpty()
  plan?: string;
}
