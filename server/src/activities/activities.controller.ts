import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActivitiesService } from './activities.service';
import {
  ActivityQueryDto,
  CreateActivityDto,
  UpdateActivityDto,
} from './dto/activity.dto';
import { TenantId } from 'src/common/decorators/teanat.decorator';

@Controller('activities')
@UseGuards(AuthGuard('jwt'))
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  create(
    @Body() createActivityDto: CreateActivityDto,
    @TenantId() tenantId: string,
  ) {
    return this.activitiesService.create(createActivityDto, tenantId);
  }

  @Get()
  findAll(@Query() query: ActivityQueryDto, @TenantId() tenantId: string) {
    return this.activitiesService.findAll(query, tenantId);
  }

  @Get('stats')
  getStats(@Query('userId') userId: string, @TenantId() tenantId: string) {
    return this.activitiesService.getStats(tenantId, userId);
  }

  @Get('upcoming')
  getUpcoming(
    @Query('userId') userId: string,
    @Query('days') days: number,
    @TenantId() tenantId: string,
  ) {
    return this.activitiesService.getUpcoming(tenantId, userId, days);
  }

  @Get(':id')
  findOne(@Query('id') id: string, @TenantId() tenantId: string) {
    return this.activitiesService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @TenantId() tenantId: string,
  ) {
    return this.activitiesService.update(id, updateActivityDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.activitiesService.remove(id, tenantId);
  }
}
