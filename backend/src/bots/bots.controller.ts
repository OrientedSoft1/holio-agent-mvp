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
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BotsService } from './bots.service.js';
import { CreateBotDto } from './dto/create-bot.dto.js';
import { UpdateBotDto } from './dto/update-bot.dto.js';
import { InviteBotDto } from './dto/invite-bot.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@ApiTags('bots')
@UseGuards(JwtAuthGuard)
@Controller()
export class BotsController {
  constructor(private readonly botsService: BotsService) {}

  @Get('bots/templates')
  @ApiOperation({ summary: 'List all bot templates' })
  getTemplates() {
    return this.botsService.getTemplates();
  }

  @Post('companies/:companyId/bots')
  @ApiOperation({ summary: 'Create a new bot for a company' })
  create(
    @CurrentUser() user: { id: string },
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: CreateBotDto,
  ) {
    dto.companyId = companyId;
    return this.botsService.create(user.id, dto);
  }

  @Get('companies/:companyId/bots')
  @ApiOperation({ summary: 'List all bots for a company' })
  findAllForCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.botsService.findAllForCompany(companyId);
  }

  @Get('companies/:companyId/bot-stats')
  @ApiOperation({ summary: 'Get aggregated bot stats for a company' })
  getCompanyBotStats(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.botsService.getCompanyBotStats(companyId);
  }

  @Get('bots/:id')
  @ApiOperation({ summary: 'Get a bot by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.botsService.findOne(id);
  }

  @Patch('bots/:id')
  @ApiOperation({ summary: 'Update a bot' })
  update(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBotDto,
  ) {
    return this.botsService.update(id, user.id, dto);
  }

  @Delete('bots/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a bot' })
  remove(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.botsService.remove(id, user.id);
  }

  @Post('bots/:id/chat')
  @ApiOperation({ summary: 'Start or get a dedicated bot chat' })
  startBotChat(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.botsService.startBotChat(id, user.id);
  }

  @Post('bots/:id/invite')
  @ApiOperation({ summary: 'Invite a bot to a chat' })
  inviteToChat(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: InviteBotDto,
  ) {
    dto.botId = id;
    return this.botsService.inviteToChat(dto.botId, dto.chatId, user.id);
  }

  @Delete('bots/:botId/chats/:chatId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a bot from a chat' })
  removeFromChat(
    @CurrentUser() user: { id: string },
    @Param('botId', ParseUUIDPipe) botId: string,
    @Param('chatId', ParseUUIDPipe) chatId: string,
  ) {
    return this.botsService.removeFromChat(botId, chatId, user.id);
  }

  @Get('chats/:chatId/bots')
  @ApiOperation({ summary: 'List bots in a chat' })
  getBotsInChat(@Param('chatId', ParseUUIDPipe) chatId: string) {
    return this.botsService.getBotsInChat(chatId);
  }

  @Post('bots/from-template')
  @ApiOperation({ summary: 'Create a bot from a template' })
  createFromTemplate(
    @CurrentUser() user: { id: string },
    @Body() body: { companyId: string; templateId: string },
  ) {
    return this.botsService.createFromTemplate(
      user.id,
      body.companyId,
      body.templateId,
    );
  }

  @Get('bots/:id/tasks')
  @ApiOperation({ summary: 'Get task history for a bot' })
  getTaskHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.botsService.getTaskHistory(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
