import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { DealStage, DealStatus } from '@prisma/client';

export class CreateDealDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  value?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(DealStage)
  @IsOptional()
  stage?: DealStage;

  @IsEnum(DealStatus)
  @IsOptional()
  status?: DealStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  probability?: number;

  @IsDateString()
  @IsOptional()
  closeDate?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  contactId?: string;

  @IsString()
  @IsNotEmpty()
  ownerId: string;
}

export class UpdateDealDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  value?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(DealStage)
  @IsOptional()
  stage?: DealStage;

  @IsEnum(DealStatus)
  @IsOptional()
  status?: DealStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  probability?: number;

  @IsDateString()
  @IsOptional()
  closeDate?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  contactId?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;
}

export class DealQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;
}
