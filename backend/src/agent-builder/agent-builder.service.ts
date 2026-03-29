import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BedrockConfigService } from '../companies/bedrock-config.service.js';
import { AgentDefinition } from './entities/agent-definition.entity.js';
import { CreateAgentDto, UpdateAgentDto } from './dto/agent.dto.js';
import { randomUUID } from 'crypto';

@Injectable()
export class AgentBuilderService {
  private readonly logger = new Logger(AgentBuilderService.name);

  constructor(
    @InjectRepository(AgentDefinition)
    private readonly agentRepo: Repository<AgentDefinition>,
    private readonly bedrockConfigService: BedrockConfigService,
  ) {}

  async listAgents(companyId: string) {
    return this.agentRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async createAgent(companyId: string, dto: CreateAgentDto) {
    const agent = this.agentRepo.create({
      companyId,
      name: dto.name,
      description: dto.description ?? null,
      modelId: dto.modelId,
      instruction: dto.instruction,
      actionGroups: dto.actionGroups ?? [],
      knowledgeBaseIds: dto.knowledgeBaseIds ?? [],
      status: 'draft',
    });
    return this.agentRepo.save(agent);
  }

  async updateAgent(agentId: string, dto: UpdateAgentDto) {
    const agent = await this.agentRepo
      .findOneOrFail({ where: { id: agentId } })
      .catch(() => {
        throw new NotFoundException('Agent not found');
      });

    Object.assign(agent, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.modelId !== undefined && { modelId: dto.modelId }),
      ...(dto.instruction !== undefined && { instruction: dto.instruction }),
      ...(dto.actionGroups !== undefined && { actionGroups: dto.actionGroups }),
      ...(dto.knowledgeBaseIds !== undefined && {
        knowledgeBaseIds: dto.knowledgeBaseIds,
      }),
    });

    return this.agentRepo.save(agent);
  }

  async deleteAgent(agentId: string) {
    const agent = await this.agentRepo
      .findOneOrFail({ where: { id: agentId } })
      .catch(() => {
        throw new NotFoundException('Agent not found');
      });
    await this.agentRepo.remove(agent);
  }

  async deployAgent(agentId: string) {
    const agent = await this.agentRepo
      .findOneOrFail({ where: { id: agentId } })
      .catch(() => {
        throw new NotFoundException('Agent not found');
      });

    const credentials = await this.bedrockConfigService.getDecryptedCredentials(
      agent.companyId,
    );
    if (!credentials) {
      throw new BadRequestException('AWS Bedrock credentials not configured');
    }

    agent.status = 'deploying';
    await this.agentRepo.save(agent);

    try {
      const {
        BedrockAgentClient,
        CreateAgentCommand,
        CreateAgentAliasCommand,
      } = await import('@aws-sdk/client-bedrock-agent');

      const client = new BedrockAgentClient({
        region: credentials.region,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
        },
      });

      const createResult = await client.send(
        new CreateAgentCommand({
          agentName: agent.name,
          description: agent.description ?? undefined,
          foundationModel: agent.modelId,
          instruction: agent.instruction,
          idleSessionTTLInSeconds: 1800,
        }),
      );

      const bedrockAgentId = createResult.agent?.agentId;
      if (!bedrockAgentId) throw new Error('Failed to create Bedrock agent');

      const aliasResult = await client.send(
        new CreateAgentAliasCommand({
          agentId: bedrockAgentId,
          agentAliasName: 'live',
        }),
      );

      agent.bedrockAgentId = bedrockAgentId;
      agent.bedrockAliasId = aliasResult.agentAlias?.agentAliasId ?? null;
      agent.status = 'active';
      await this.agentRepo.save(agent);
    } catch (error) {
      this.logger.error(`Agent deploy failed: ${error}`);
      agent.status = 'failed';
      await this.agentRepo.save(agent);
      throw error;
    }

    return agent;
  }

  async invokeAgent(agentId: string, input: string, sessionId?: string) {
    const agent = await this.agentRepo
      .findOneOrFail({ where: { id: agentId } })
      .catch(() => {
        throw new NotFoundException('Agent not found');
      });

    if (!agent.bedrockAgentId || !agent.bedrockAliasId) {
      throw new BadRequestException('Agent has not been deployed to Bedrock');
    }

    const credentials = await this.bedrockConfigService.getDecryptedCredentials(
      agent.companyId,
    );
    if (!credentials) {
      throw new BadRequestException('AWS Bedrock credentials not configured');
    }

    const { BedrockAgentRuntimeClient, InvokeAgentCommand } =
      await import('@aws-sdk/client-bedrock-agent-runtime');

    const client = new BedrockAgentRuntimeClient({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });

    const response = await client.send(
      new InvokeAgentCommand({
        agentId: agent.bedrockAgentId,
        agentAliasId: agent.bedrockAliasId,
        sessionId: sessionId ?? randomUUID(),
        inputText: input,
      }),
    );

    let fullResponse = '';
    if (response.completion) {
      for await (const event of response.completion) {
        if (event.chunk?.bytes) {
          fullResponse += new TextDecoder().decode(event.chunk.bytes);
        }
      }
    }

    return { response: fullResponse };
  }
}
