import {
  Controller,
  Get,
  Post,
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
import { ChatsService } from './chats.service.js';
import { CreateDmDto } from './dto/create-dm.dto.js';
import { CreateChannelDto } from './dto/create-channel.dto.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('chats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('dm')
  @ApiOperation({ summary: 'Create or return existing DM' })
  createDM(@CurrentUser() user: User, @Body() dto: CreateDmDto) {
    return this.chatsService.createDM(user.id, dto.targetUserId);
  }

  @Post('channel')
  @ApiOperation({ summary: 'Create a new company channel' })
  createChannel(@CurrentUser() user: User, @Body() dto: CreateChannelDto) {
    return this.chatsService.createChannel(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all chats for the current user' })
  findAll(@CurrentUser() user: User, @Query('companyId') companyId?: string) {
    return this.chatsService.findAllForUser(user.id, companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chat details with members' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.chatsService.findOne(id, user.id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to a chat' })
  addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: AddMemberDto,
  ) {
    return this.chatsService.addMember(id, dto.userId, user.id);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from a chat' })
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() user: User,
  ) {
    return this.chatsService.removeMember(id, userId, user.id);
  }
}
