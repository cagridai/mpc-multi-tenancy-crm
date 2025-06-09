import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { CompanySize, CompanyStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ enum: CompanySize })
  @IsEnum(CompanySize)
  @IsOptional()
  size?: CompanySize;

  @ApiPropertyOptional({ enum: CompanyStatus })
  @IsEnum(CompanyStatus)
  @IsOptional()
  status?: CompanyStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ enum: CompanySize })
  @IsEnum(CompanySize)
  @IsOptional()
  size?: CompanySize;

  @ApiPropertyOptional({ enum: CompanyStatus })
  @IsEnum(CompanyStatus)
  @IsOptional()
  status?: CompanyStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

export class CompanyQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CompanyStatus })
  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;

  @ApiPropertyOptional({ enum: CompanySize })
  @IsOptional()
  @IsEnum(CompanySize)
  size?: CompanySize;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ type: Number, default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ type: Number, default: 10 })
  @IsOptional()
  limit?: number = 10;
}
