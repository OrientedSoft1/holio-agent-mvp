import {
  Controller,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('search')
  @ApiOperation({ summary: 'Global search across chats, users, and messages' })
  globalSearch(@Query('q') query: string, @CurrentUser() user: User) {
    return this.searchService.globalSearch(query, user.id);
  }

  @Get('chats/:chatId/search')
  @ApiOperation({ summary: 'Search messages within a specific chat' })
  searchMessages(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Query('q') query: string,
    @Query('type') mediaType: string,
    @Query('from') dateFrom: string,
    @Query('to') dateTo: string,
    @CurrentUser() user: User,
  ) {
    return this.searchService.searchMessages(chatId, query, user.id, {
      mediaType,
      dateFrom,
      dateTo,
    });
  }
}
