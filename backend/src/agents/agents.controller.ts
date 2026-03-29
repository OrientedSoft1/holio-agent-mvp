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
import { AgentsService } from './agents.service.js';
import { CreateAgentDto, UpdateAgentDto } from './dto/agent.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('agents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get('companies/:companyId/agents')
  @ApiOperation({ summary: 'List all agents for a company' })
  findAll(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.agentsService.findAll(companyId);
  }

  @Post('companies/:companyId/agents')
  @ApiOperation({ summary: 'Create an agent' })
  create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateAgentDto,
  ) {
    return this.agentsService.create(companyId, user.id, dto);
  }

  @Patch('agents/:agentId')
  @ApiOperation({ summary: 'Update an agent' })
  update(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Body() dto: UpdateAgentDto,
  ) {
    return this.agentsService.update(agentId, dto);
  }

  @Delete('agents/:agentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an agent' })
  remove(@Param('agentId', ParseUUIDPipe) agentId: string) {
    return this.agentsService.remove(agentId);
  }

  @Post('agents/:agentId/deploy')
  @ApiOperation({ summary: 'Deploy an agent to AWS Bedrock' })
  deploy(@Param('agentId', ParseUUIDPipe) agentId: string) {
    return this.agentsService.deploy(agentId);
  }

  @Post('agents/:agentId/invoke')
  @ApiOperation({ summary: 'Invoke an agent' })
  invoke(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Body() body: { input: string; sessionId?: string },
  ) {
    return this.agentsService.invoke(agentId, body.input, body.sessionId);
  }
}
