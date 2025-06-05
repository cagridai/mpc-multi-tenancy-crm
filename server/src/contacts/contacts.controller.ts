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
import { ContactsService } from './contacts.service';
import { ContactQueryDto, CreateContactDto } from './dto/contact.dto';
import { TenantId } from 'src/common/decorators/teanat.decorator';

@Controller('contacts')
@UseGuards(AuthGuard('jwt'))
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(
    @Body() createContactDto: CreateContactDto,
    @TenantId() tenantId: string,
  ) {
    return this.contactsService.create(createContactDto, tenantId);
  }

  @Get()
  findAll(@Query() query: ContactQueryDto, @TenantId() tenantId: string) {
    return this.contactsService.findAll(query, tenantId);
  }

  @Get('stats')
  getStats(@TenantId() tenantId: string) {
    return this.contactsService.getStats(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.contactsService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContactDto: CreateContactDto,
    @TenantId() tenantId: string,
  ) {
    return this.contactsService.update(id, updateContactDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.contactsService.remove(id, tenantId);
  }
}
