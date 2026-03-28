import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service.js';
import { AddContactDto, UpdateContactDto } from './dto/contact.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a contact' })
  addContact(@CurrentUser() user: User, @Body() dto: AddContactDto) {
    return this.contactsService.addContact(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List contacts (with optional search)' })
  getContacts(
    @CurrentUser() user: User,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contactsService.getContacts(
      user.id,
      search,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('favorites')
  @ApiOperation({ summary: 'List favorite contacts' })
  getFavorites(@CurrentUser() user: User) {
    return this.contactsService.getFavorites(user.id);
  }

  @Get('blocked')
  @ApiOperation({ summary: 'List blocked users' })
  getBlocked(@CurrentUser() user: User) {
    return this.contactsService.getBlocked(user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact (nickname, favorite)' })
  updateContact(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.updateContact(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a contact' })
  removeContact(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.contactsService.removeContact(user.id, id);
  }

  @Post('block/:userId')
  @ApiOperation({ summary: 'Block a user' })
  blockUser(
    @CurrentUser() user: User,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.contactsService.blockUser(user.id, userId);
  }

  @Post('unblock/:userId')
  @ApiOperation({ summary: 'Unblock a user' })
  unblockUser(
    @CurrentUser() user: User,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.contactsService.unblockUser(user.id, userId);
  }
}
