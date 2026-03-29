import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StoriesService } from './stories.service.js';
import { CreateStoryDto } from './dto/create-story.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('stories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new story' })
  create(@CurrentUser() user: User, @Body() dto: CreateStoryDto) {
    return this.storiesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get stories for the current user' })
  findForUser(@CurrentUser() user: User) {
    return this.storiesService.findForUser(user.id);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Mark a story as viewed' })
  view(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.storiesService.view(id, user.id);
  }

  @Post(':id/react')
  @ApiOperation({ summary: 'React to a story' })
  react(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body('emoji') emoji: string,
  ) {
    return this.storiesService.react(id, user.id, emoji);
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Reply to a story' })
  reply(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body('content') content: string,
  ) {
    return this.storiesService.reply(id, user.id, content);
  }

  @Get(':id/viewers')
  @ApiOperation({ summary: 'Get viewers of a story (owner only)' })
  getViewers(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.storiesService.getViewers(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a story (owner only)' })
  delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.storiesService.delete(id, user.id);
  }

  @Delete('expired/cleanup')
  @ApiOperation({ summary: 'Cleanup expired stories' })
  deleteExpired() {
    return this.storiesService.deleteExpired();
  }
}
