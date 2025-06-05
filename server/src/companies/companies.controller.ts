import {
  Controller,
  UseGuards,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompaniesService } from './companies.service';
import { CompanyQueryDto, CreateCompanyDto } from './dto/company.dto';
import { TenantId } from 'src/common/decorators/teanat.decorator';

@Controller('companies')
@UseGuards(AuthGuard('jwt'))
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @TenantId() tenantId: string,
  ) {
    return this.companiesService.create(createCompanyDto, tenantId);
  }

  @Get()
  findAll(@Query() query: CompanyQueryDto, @TenantId() tenantId: string) {
    return this.companiesService.findAll(query, tenantId);
  }

  @Get('stats')
  getStats(@TenantId() tenantId: string) {
    return this.companiesService.getStats(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.companiesService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: CreateCompanyDto,
    @TenantId() tenantId: string,
  ) {
    return this.companiesService.update(id, updateCompanyDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.companiesService.remove(id, tenantId);
  }
}
