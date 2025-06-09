import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { ActivityType, ActivityStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ActivityType })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiPropertyOptional({ enum: ActivityStatus })
  @IsEnum(ActivityStatus)
  @IsOptional()
  status?: ActivityStatus;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  assignedToId: string;

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
  dealId?: string;
}

export class UpdateActivityDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ActivityType })
  @IsEnum(ActivityType)
  @IsOptional()
  type?: ActivityType;

  @ApiPropertyOptional({ enum: ActivityStatus })
  @IsEnum(ActivityStatus)
  @IsOptional()
  status?: ActivityStatus;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assignedToId?: string;

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
  dealId?: string;
}

export class ActivityQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ActivityType })
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @ApiPropertyOptional({ enum: ActivityStatus })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dealId?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  overdue?: boolean;

  @ApiPropertyOptional({ type: Number, default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ type: Number, default: 10 })
  @IsOptional()
  limit?: number = 10;
}
