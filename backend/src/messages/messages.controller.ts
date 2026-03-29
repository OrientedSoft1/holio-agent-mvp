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
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service.js';
import { ChatsService } from '../chats/chats.service.js';
import { BotsService } from '../bots/bots.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { UpdateMessageDto } from './dto/update-message.dto.js';
import { ForwardMessageDto } from './dto/forward-message.dto.js';
import { ScheduleMessageDto } from './dto/schedule-message.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatsService: ChatsService,
    private readonly botsService: BotsService,
  ) {}

  @Get('chats/:chatId/messages')
  @ApiOperation({ summary: 'Get paginated messages for a chat' })
  async findByChatId(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('pinned') pinned?: string,
  ) {
    await this.chatsService.checkMembership(chatId, user.id);
    return this.messagesService.findByChatId(
      chatId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
      { pinned: pinned === 'true' },
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
    const message = await this.messagesService.create(chatId, user.id, dto);

    if (dto.content) {
      this.botsService
        .handleMentions(dto.content, chatId, message.id)
        .catch((err) =>
          this.logger.debug(`Bot mention handling failed: ${err}`),
        );
    }

    return message;
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

  @Post('messages/:id/pin')
  @ApiOperation({ summary: 'Toggle pin status on a message' })
  pin(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.messagesService.pin(id, user.id);
  }

  @Post('messages/forward')
  @ApiOperation({ summary: 'Forward a message to another chat' })
  forward(@CurrentUser() user: User, @Body() dto: ForwardMessageDto) {
    return this.messagesService.forward(
      dto.targetChatId,
      dto.messageId,
      user.id,
    );
  }

  @Post('chats/:chatId/read')
  @ApiOperation({ summary: 'Mark all messages in a chat as read' })
  async markChatAsRead(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: User,
  ) {
    await this.chatsService.checkMembership(chatId, user.id);
    const result = await this.messagesService.markChatAsRead(chatId, user.id);
    return { marked: result.receipts.length };
  }

  @Get('messages/:id/read-receipts')
  @ApiOperation({ summary: 'Get read receipts for a message' })
  getReadReceipts(@Param('id', ParseUUIDPipe) id: string) {
    return this.messagesService.getReadReceipts(id);
  }

  @Get('messages/:id/group-reads')
  @ApiOperation({
    summary: 'Get group read receipts (sender only, 7-day window)',
  })
  getGroupReadReceipts(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.getGroupReadReceipts(id, user.id);
  }

  // ──── Scheduled Messages ────

  @Post('chats/:chatId/messages/schedule')
  @ApiOperation({ summary: 'Schedule a message for later delivery' })
  async scheduleMessage(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: User,
    @Body() dto: ScheduleMessageDto,
  ) {
    await this.chatsService.checkMembership(chatId, user.id);
    return this.messagesService.scheduleMessage(chatId, user.id, dto);
  }

  @Get('chats/:chatId/messages/scheduled')
  @ApiOperation({ summary: 'List scheduled messages in a chat' })
  async getScheduledMessages(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: User,
  ) {
    await this.chatsService.checkMembership(chatId, user.id);
    return this.messagesService.getScheduledMessages(chatId, user.id);
  }

  @Delete('messages/:id/schedule')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a scheduled message' })
  cancelScheduledMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.cancelScheduledMessage(id, user.id);
  }

  // ──── Saved Messages ────

  @Get('saved-messages')
  @ApiOperation({ summary: 'Get saved messages for the current user' })
  getSavedMessages(@CurrentUser() user: User) {
    return this.messagesService.getSavedMessages(user.id);
  }

  @Post('saved-messages/:messageId')
  @ApiOperation({ summary: 'Save a message to Saved Messages' })
  saveMessage(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.saveMessage(messageId, user.id);
  }

  @Delete('saved-messages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unsave a message' })
  unsaveMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.unsaveMessage(user.id, id);
  }

  // ──── Send Scheduled Now ────

  @Post('messages/:id/send-now')
  @ApiOperation({ summary: 'Send a scheduled message immediately' })
  sendNow(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.messagesService.sendScheduledNow(id, user.id);
  }

  // ──── Media Counts ────

  @Get('chats/:chatId/media-counts')
  @ApiOperation({ summary: 'Get media item counts by type for a chat' })
  async getMediaCounts(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: User,
  ) {
    await this.chatsService.checkMembership(chatId, user.id);
    return this.messagesService.getMediaCounts(chatId);
  }
}
