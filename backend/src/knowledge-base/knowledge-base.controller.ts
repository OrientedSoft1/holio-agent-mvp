import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KnowledgeBaseService } from './knowledge-base.service.js';
import { QueryKBDto, RagQueryDto } from './dto/query-kb.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@ApiTags('knowledge-bases')
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/knowledge-bases')
export class KnowledgeBaseController {
  constructor(private readonly kbService: KnowledgeBaseService) {}

  @Get()
  @ApiOperation({ summary: 'List knowledge bases' })
  list(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.kbService.listKnowledgeBases(companyId);
  }

  @Get(':kbId')
  @ApiOperation({ summary: 'Get knowledge base details' })
  getOne(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('kbId') kbId: string,
  ) {
    return this.kbService.getKnowledgeBase(companyId, kbId);
  }

  @Post(':kbId/query')
  @ApiOperation({ summary: 'Query a knowledge base' })
  query(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('kbId') kbId: string,
    @Body() dto: QueryKBDto,
  ) {
    return this.kbService.queryKB(companyId, kbId, dto.query, dto.maxResults);
  }

  @Post(':kbId/rag')
  @ApiOperation({ summary: 'RAG query against a knowledge base' })
  rag(
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
    return this.kbService.syncKB(companyId, kbId);
  }
}
