import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GifsService } from './gifs.service.js';

@ApiTags('gifs')
@ApiBearerAuth()
@Controller('gifs')
export class GifsController {
  constructor(private readonly gifsService: GifsService) {}

  @Get('trending')
  @ApiOperation({ summary: 'Get trending GIFs' })
  trending(@Query('limit') limit?: string) {
    return this.gifsService.trending(limit ? parseInt(limit) : 20);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search GIFs' })
  search(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.gifsService.search(query, limit ? parseInt(limit) : 20);
  }
}
