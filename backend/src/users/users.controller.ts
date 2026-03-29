import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UpdatePrivacyDto } from './dto/update-privacy.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from './entities/user.entity.js';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  getCurrentUser(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/privacy')
  @ApiOperation({ summary: 'Update privacy settings' })
  updatePrivacy(@CurrentUser() user: User, @Body() dto: UpdatePrivacyDto) {
    return this.usersService.updatePrivacy(user.id, dto);
  }

  @Post('me/2fa/enable')
  @ApiOperation({ summary: 'Enable two-step verification' })
  setup2fa(@CurrentUser() user: User, @Body('password') password: string) {
    return this.usersService.setup2fa(user.id, password);
  }

  @Post('me/2fa/disable')
  @ApiOperation({ summary: 'Disable two-step verification' })
  disable2fa(@CurrentUser() user: User, @Body('password') password: string) {
    return this.usersService.disable2fa(user.id, password);
  }

  @Get('me/notification-settings')
  @ApiOperation({ summary: 'Get notification settings' })
  async getNotificationSettings(@CurrentUser() user: User) {
    const u = await this.usersService.findOne(user.id);
    return u.settings?.notifications ?? {};
  }

  @Patch('me/notification-settings')
  @ApiOperation({ summary: 'Update notification settings' })
  updateNotificationSettings(
    @CurrentUser() user: User,
    @Body() body: Record<string, unknown>,
  ) {
    return this.usersService.updateSettings(user.id, 'notifications', body);
  }

  @Get('me/chat-appearance')
  @ApiOperation({ summary: 'Get chat appearance settings' })
  async getChatAppearance(@CurrentUser() user: User) {
    const u = await this.usersService.findOne(user.id);
    return u.settings?.chatAppearance ?? {};
  }

  @Patch('me/chat-appearance')
  @ApiOperation({ summary: 'Update chat appearance settings' })
  updateChatAppearance(
    @CurrentUser() user: User,
    @Body() body: Record<string, unknown>,
  ) {
    return this.usersService.updateSettings(user.id, 'chatAppearance', body);
  }

  @Get('me/data-storage')
  @ApiOperation({ summary: 'Get data storage settings' })
  async getDataStorage(@CurrentUser() user: User) {
    const u = await this.usersService.findOne(user.id);
    return u.settings?.dataStorage ?? {};
  }

  @Patch('me/data-storage')
  @ApiOperation({ summary: 'Update data storage settings' })
  updateDataStorage(
    @CurrentUser() user: User,
    @Body() body: Record<string, unknown>,
  ) {
    return this.usersService.updateSettings(user.id, 'dataStorage', body);
  }

  @Get('me/storage-usage')
  @ApiOperation({ summary: 'Get storage usage statistics' })
  async getStorageUsage(@CurrentUser() user: User) {
    const u = await this.usersService.findOne(user.id);
    return (
      u.settings?.storageUsage ?? {
        usedBytes: 0,
        totalBytes: 0,
      }
    );
  }

  @Get('me/network-stats')
  @ApiOperation({ summary: 'Get network statistics' })
  async getNetworkStats(@CurrentUser() user: User) {
    const u = await this.usersService.findOne(user.id);
    return (
      u.settings?.networkStats ?? {
        sentBytes: 0,
        receivedBytes: 0,
      }
    );
  }

  @Post('me/network-stats/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset network statistics' })
  resetNetworkStats(@CurrentUser() user: User) {
    return this.usersService.updateSettings(user.id, 'networkStats', {
      lastReset: new Date().toISOString(),
    });
  }

  @Post('me/clear-cache')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear user cache' })
  async clearCache(@CurrentUser() user: User) {
    await this.usersService.clearUserCache(user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by username or phone' })
  searchUsers(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find users nearby (requires geolocation)' })
  findNearby(@Query('lat') lat?: string, @Query('lng') lng?: string) {
    return this.usersService.findNearby(
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
    );
  }

  @Get('check-username/:username')
  @ApiOperation({ summary: 'Check if a username is available' })
  async checkUsername(@Param('username') username: string) {
    return this.usersService.checkUsername(username);
  }

  @Get(':id/common-groups')
  @ApiOperation({ summary: 'Get common groups with another user' })
  async getCommonGroups(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.usersService.getCommonGroups(user.id, id);
  }

  @Get(':id/presence')
  @ApiOperation({ summary: 'Get user presence / last-seen status' })
  async getPresence(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() viewer: User,
  ) {
    const target = await this.usersService.findOne(id);
    return this.usersService.getPresence(target, viewer.id);
  }

  @Get(':id/shared-media')
  @ApiOperation({ summary: 'Get shared media for a user' })
  findSharedMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('type') type?: string,
  ) {
    return this.usersService.findSharedMedia(id, type);
  }
}
