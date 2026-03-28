import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chats/:chatId')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('mute')
  @ApiOperation({ summary: 'Mute a chat' })
  muteChat(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: User,
    @Body('duration') duration?: string,
  ) {
    return this.notificationsService.muteChat(user.id, chatId, duration);
  }

  @Post('unmute')
  @ApiOperation({ summary: 'Unmute a chat' })
  unmuteChat(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.unmuteChat(user.id, chatId);
  }

  @Get('notification-settings')
  @ApiOperation({ summary: 'Get notification settings for a chat' })
  getSettings(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.getSettings(user.id, chatId);
  }
}
