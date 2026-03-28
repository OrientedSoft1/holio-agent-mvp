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
import { GroupsService } from './groups.service.js';
import { CreateChannelDto } from './dto/create-channel.dto.js';
import { UpdateChannelDto } from './dto/update-channel.dto.js';
import { SetPermissionsDto } from './dto/set-permissions.dto.js';
import { CreateInviteLinkDto } from './dto/create-invite-link.dto.js';
import { CreateCrossCompanyGroupDto } from './dto/create-cross-company-group.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post('channel')
  @ApiOperation({ summary: 'Create a company channel' })
  createChannel(@CurrentUser() user: User, @Body() dto: CreateChannelDto) {
    return this.groupsService.createChannel(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update channel settings' })
  updateChannel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateChannelDto,
  ) {
    return this.groupsService.updateChannel(id, user.id, dto);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get paginated channel members' })
  getChannelMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.groupsService.getChannelMembers(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Set per-user channel permissions' })
  setPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: SetPermissionsDto,
  ) {
    return this.groupsService.setPermissions(
      id,
      dto.userId,
      dto.permissions,
      user.id,
    );
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Kick a member from a channel' })
  kickMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() user: User,
  ) {
    return this.groupsService.kickMember(id, userId, user.id);
  }

  @Post(':id/ban/:userId')
  @ApiOperation({ summary: 'Ban a member from a channel' })
  banMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() user: User,
  ) {
    return this.groupsService.banMember(id, userId, user.id);
  }

  @Post(':id/invite-link')
  @ApiOperation({ summary: 'Generate a channel invite link' })
  generateInviteLink(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: CreateInviteLinkDto,
  ) {
    return this.groupsService.generateInviteLink(
      id,
      user.id,
      dto.expiresInHours,
    );
  }

  @Post('join/:token')
  @ApiOperation({ summary: 'Join a channel via invite link' })
  joinViaInviteLink(@Param('token') token: string, @CurrentUser() user: User) {
    return this.groupsService.joinViaInviteLink(token, user.id);
  }

  @Post('cross-company')
  @ApiOperation({ summary: 'Create a cross-company group' })
  createCrossCompanyGroup(
    @CurrentUser() user: User,
    @Body() dto: CreateCrossCompanyGroupDto,
  ) {
    return this.groupsService.createCrossCompanyGroup(user.id, dto);
  }
}
