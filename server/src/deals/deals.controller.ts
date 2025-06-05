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
import { DealsService } from './deals.service';
import { CreateDealDto, DealQueryDto, UpdateDealDto } from './dto/deal.dto';
import { TenantId } from 'src/common/decorators/teanat.decorator';

@Controller('deals')
@UseGuards(AuthGuard('jwt'))
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  create(@Body() createDealDto: CreateDealDto, @TenantId() tenantId: string) {
    return this.dealsService.create(createDealDto, tenantId);
  }

  @Get()
  findAll(@Query() query: DealQueryDto, @TenantId() tenantId: string) {
    return this.dealsService.findAll(query, tenantId);
  }

  @Get('stats')
  getStats(@TenantId() tenantId: string) {
    return this.dealsService.getStats(tenantId);
  }

  @Get('pipeline')
  getPipeline(@TenantId() tenantId: string) {
    return this.dealsService.getPipeline(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.dealsService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto,
    @TenantId() tenantId: string,
  ) {
    return this.dealsService.update(id, updateDealDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.dealsService.remove(id, tenantId);
  }
}
