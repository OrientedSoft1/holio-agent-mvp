import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AIUsageService } from './ai-usage.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@ApiTags('ai-usage')
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/ai-usage')
export class AIUsageController {
  constructor(private readonly aiUsageService: AIUsageService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get AI usage summary' })
  getSummary(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.aiUsageService.getSummary(companyId);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Get daily AI usage' })
  getDaily(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('days') days?: string,
  ) {
    return this.aiUsageService.getDailyUsage(
      companyId,
      days ? parseInt(days, 10) : 30,
    );
  }

  @Get('by-model')
  @ApiOperation({ summary: 'Get AI usage by model' })
  getByModel(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.aiUsageService.getByModel(companyId);
  }

  @Get('by-bot')
  @ApiOperation({ summary: 'Get AI usage by bot' })
  getByBot(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.aiUsageService.getByBot(companyId);
  }
}
