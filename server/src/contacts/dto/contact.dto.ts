import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { ContactStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({ enum: ContactStatus })
  @IsEnum(ContactStatus)
  @IsOptional()
  status?: ContactStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  companyId?: string;
}

export class UpdateContactDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({ enum: ContactStatus })
  @IsEnum(ContactStatus)
  @IsOptional()
  status?: ContactStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  companyId?: string;
}

export class ContactQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ContactStatus })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ type: Number, default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ type: Number, default: 10 })
  @IsOptional()
  limit?: number = 10;
}
