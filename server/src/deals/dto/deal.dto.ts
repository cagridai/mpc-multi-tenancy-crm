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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDealDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  value?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ enum: DealStage })
  @IsEnum(DealStage)
  @IsOptional()
  stage?: DealStage;

  @ApiPropertyOptional({ enum: DealStatus })
  @IsEnum(DealStatus)
  @IsOptional()
  status?: DealStatus;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  probability?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  closeDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contactId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ownerId: string;
}

export class UpdateDealDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  value?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ enum: DealStage })
  @IsEnum(DealStage)
  @IsOptional()
  stage?: DealStage;

  @ApiPropertyOptional({ enum: DealStatus })
  @IsEnum(DealStatus)
  @IsOptional()
  status?: DealStatus;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  probability?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  closeDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contactId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ownerId?: string;
}

export class DealQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: DealStage })
  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @ApiPropertyOptional({ enum: DealStatus })
  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerId?: string;

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
