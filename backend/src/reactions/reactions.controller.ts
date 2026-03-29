import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReactionsService } from './reactions.service.js';
import { AddReactionDto } from './dto/add-reaction.dto.js';
import { CreatePollDto } from './dto/create-poll.dto.js';
import { VotePollDto } from './dto/vote-poll.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('reactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  // ──── Reactions ────

  @Post('messages/:id/reactions')
  @ApiOperation({ summary: 'Toggle a reaction on a message' })
  addReaction(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: AddReactionDto,
  ) {
    return this.reactionsService.addReaction(id, user.id, dto.emoji);
  }

  @Delete('messages/:id/reactions')
  @ApiOperation({ summary: 'Remove a reaction from a message' })
  removeReaction(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: AddReactionDto,
  ) {
    return this.reactionsService.removeReaction(id, user.id, dto.emoji);
  }

  @Get('messages/:id/reactions')
  @ApiOperation({ summary: 'Get reactions for a message grouped by emoji' })
  getReactions(@Param('id', ParseUUIDPipe) id: string) {
    return this.reactionsService.getReactions(id);
  }

  // ──── Polls ────

  @Post('polls')
  @ApiOperation({ summary: 'Create a poll' })
  createPoll(@CurrentUser() user: User, @Body() dto: CreatePollDto) {
    return this.reactionsService.createPoll(user.id, dto);
  }

  @Post('polls/:id/vote')
  @ApiOperation({ summary: 'Vote on a poll' })
  vote(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: VotePollDto,
  ) {
    return this.reactionsService.vote(id, user.id, dto.optionIndex);
  }

  @Get('polls/:id/results')
  @ApiOperation({ summary: 'Get poll results' })
  getResults(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.reactionsService.getResults(id, user.id);
  }

  @Post('polls/:id/close')
  @ApiOperation({ summary: 'Close a poll (creator only)' })
  closePoll(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.reactionsService.closePoll(id, user.id);
  }

  @Post('messages/:id/poll-vote')
  @ApiOperation({ summary: 'Vote on a poll by message ID' })
  async voteByMessage(
    @Param('id', ParseUUIDPipe) messageId: string,
    @CurrentUser() user: User,
    @Body() dto: VotePollDto,
  ) {
    const poll = await this.reactionsService.findPollByMessageId(messageId);
    return this.reactionsService.vote(poll.id, user.id, dto.optionIndex);
  }

  @Post('messages/:id/poll-close')
  @ApiOperation({ summary: 'Close a poll by message ID (creator only)' })
  async closeByMessage(
    @Param('id', ParseUUIDPipe) messageId: string,
    @CurrentUser() user: User,
  ) {
    const poll = await this.reactionsService.findPollByMessageId(messageId);
    return this.reactionsService.closePoll(poll.id, user.id);
  }
}
