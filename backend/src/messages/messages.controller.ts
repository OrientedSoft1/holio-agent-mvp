import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service.js';
import { ChatsService } from '../chats/chats.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { UpdateMessageDto } from './dto/update-message.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatsService: ChatsService,
  ) {}

  @Get('chats/:chatId/messages')
  @ApiOperation({ summary: 'Get paginated messages for a chat' })
  async findByChatId(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    await this.chatsService.checkMembership(chatId, user.id);
    return this.messagesService.findByChatId(
      chatId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post('chats/:chatId/messages')
  @ApiOperation({ summary: 'Send a message to a chat (REST fallback)' })
  async create(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateMessageDto,
  ) {
    await this.chatsService.checkMembership(chatId, user.id);
    return this.messagesService.create(chatId, user.id, dto);
  }

  @Patch('messages/:id')
  @ApiOperation({ summary: 'Edit a message' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.messagesService.update(id, user.id, dto.content);
  }

  @Delete('messages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a message' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.messagesService.remove(id, user.id);
  }
}
