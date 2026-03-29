import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TagsService } from './tags.service.js';
import { CreateTagDto, UpdateTagDto, AddMessageTagDto } from './dto/tag.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post('tags')
  @ApiOperation({ summary: 'Create a tag' })
  create(@CurrentUser() user: User, @Body() dto: CreateTagDto) {
    return this.tagsService.create(user.id, dto);
  }

  @Get('tags')
  @ApiOperation({ summary: 'List all tags for the user' })
  findAll(@CurrentUser() user: User) {
    return this.tagsService.findAll(user.id);
  }

  @Patch('tags/:id')
  @ApiOperation({ summary: 'Update a tag' })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTagDto,
  ) {
    return this.tagsService.update(user.id, id, dto);
  }

  @Delete('tags/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a tag' })
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.tagsService.remove(user.id, id);
  }

  @Post('messages/:messageId/tags')
  @ApiOperation({ summary: 'Add a tag to a message' })
  addTagToMessage(
    @CurrentUser() user: User,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() dto: AddMessageTagDto,
  ) {
    return this.tagsService.addTagToMessage(user.id, messageId, dto.tagId);
  }

  @Delete('messages/:messageId/tags/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a tag from a message' })
  removeTagFromMessage(
    @CurrentUser() user: User,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Param('tagId', ParseUUIDPipe) tagId: string,
  ) {
    return this.tagsService.removeTagFromMessage(user.id, messageId, tagId);
  }

  @Get('tags/:id/messages')
  @ApiOperation({ summary: 'Get messages tagged with this tag' })
  findMessagesByTag(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tagsService.findMessagesByTag(user.id, id);
  }
}
