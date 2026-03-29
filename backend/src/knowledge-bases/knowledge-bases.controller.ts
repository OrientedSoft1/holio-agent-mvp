import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KnowledgeBasesService } from './knowledge-bases.service.js';
import { QueryKBDto, RagQueryDto, CreateKBDto } from './dto/query-kb.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('knowledge-bases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/knowledge-bases')
export class KnowledgeBasesController {
  constructor(private readonly kbService: KnowledgeBasesService) {}

  @Get()
  @ApiOperation({ summary: 'List knowledge bases for a company' })
  findAll(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.kbService.findAll(companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a knowledge base' })
  create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateKBDto,
  ) {
    return this.kbService.create(companyId, user.id, dto);
  }

  @Get(':kbId')
  @ApiOperation({ summary: 'Get knowledge base details' })
  getOne(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('kbId') kbId: string,
  ) {
    return this.kbService.getOne(companyId, kbId);
  }

  @Post(':kbId/query')
  @ApiOperation({ summary: 'Query a knowledge base' })
  query(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('kbId') kbId: string,
    @Body() dto: QueryKBDto,
  ) {
    return this.kbService.query(companyId, kbId, dto.query, dto.maxResults);
  }

  @Post(':kbId/rag')
  @ApiOperation({ summary: 'RAG query against a knowledge base' })
  ragQuery(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('kbId') kbId: string,
    @Body() dto: RagQueryDto,
  ) {
    return this.kbService.ragQuery(companyId, kbId, dto.query, dto.modelId);
  }

  @Post(':kbId/sync')
  @ApiOperation({ summary: 'Trigger knowledge base sync' })
  sync(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('kbId') kbId: string,
  ) {
    return this.kbService.sync(companyId, kbId);
  }

  @Delete(':kbId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a knowledge base' })
  remove(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('kbId') kbId: string,
  ) {
    return this.kbService.remove(companyId, kbId);
  }
}
