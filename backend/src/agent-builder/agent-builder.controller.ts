import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AgentBuilderService } from './agent-builder.service.js';
import {
  CreateAgentDto,
  UpdateAgentDto,
  InvokeAgentDto,
} from './dto/agent.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@ApiTags('agent-builder')
@UseGuards(JwtAuthGuard)
@Controller()
export class AgentBuilderController {
  constructor(private readonly agentBuilderService: AgentBuilderService) {}

  @Get('companies/:companyId/agents')
  @ApiOperation({ summary: 'List agents for a company' })
  list(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.agentBuilderService.listAgents(companyId);
  }

  @Post('companies/:companyId/agents')
  @ApiOperation({ summary: 'Create an agent definition' })
  create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: CreateAgentDto,
  ) {
    return this.agentBuilderService.createAgent(companyId, dto);
  }

  @Patch('agents/:id')
  @ApiOperation({ summary: 'Update an agent' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAgentDto) {
    return this.agentBuilderService.updateAgent(id, dto);
  }

  @Delete('agents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an agent' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.agentBuilderService.deleteAgent(id);
  }

  @Post('agents/:id/deploy')
  @ApiOperation({ summary: 'Deploy agent to AWS Bedrock' })
  deploy(@Param('id', ParseUUIDPipe) id: string) {
    return this.agentBuilderService.deployAgent(id);
  }

  @Post('agents/:id/invoke')
  @ApiOperation({ summary: 'Invoke a deployed agent' })
  invoke(@Param('id', ParseUUIDPipe) id: string, @Body() dto: InvokeAgentDto) {
    return this.agentBuilderService.invokeAgent(id, dto.input, dto.sessionId);
  }
}
