/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Post,
  Query,
  UseGuards,
  Request,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotesService } from './notes.service';
import { CreateNoteDto, NoteQueryDto, UpdateNoteDto } from './dto/note.dto';
import { TenantId } from 'src/common/decorators/teanat.decorator';

@Controller('notes')
@UseGuards(AuthGuard('jwt'))
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(
    @Body() createNoteDto: CreateNoteDto,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.notesService.create(createNoteDto, req.user.id, tenantId);
  }

  @Get()
  findAll(@Query() query: NoteQueryDto, @TenantId() tenantId: string) {
    return this.notesService.findAll(query, tenantId);
  }

  @Get('stats')
  getStats(@Query('userId') userId: string, @TenantId() tenantId: string) {
    return this.notesService.getStats(tenantId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.notesService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.notesService.update(id, updateNoteDto, req.user.id, tenantId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.notesService.remove(id, req.user.id, tenantId);
  }
}
