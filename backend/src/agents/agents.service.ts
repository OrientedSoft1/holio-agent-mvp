import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from './entities/agent.entity.js';
import { CreateAgentDto, UpdateAgentDto } from './dto/agent.dto.js';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepo: Repository<Agent>,
  ) {}

  async findAll(companyId: string): Promise<Agent[]> {
    return this.agentRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    companyId: string,
    userId: string,
    dto: CreateAgentDto,
  ): Promise<Agent> {
    const agent = this.agentRepo.create({
      companyId,
      createdBy: userId,
      name: dto.name,
      description: dto.description ?? null,
      modelId: dto.modelId,
      instruction: dto.instruction,
      actionGroups: dto.actionGroups ?? [],
      knowledgeBaseIds: dto.knowledgeBaseIds ?? [],
    });

    return this.agentRepo.save(agent);
  }

  async update(agentId: string, dto: UpdateAgentDto): Promise<Agent> {
    const agent = await this.agentRepo.findOne({ where: { id: agentId } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    if (dto.name !== undefined) agent.name = dto.name;
    if (dto.description !== undefined)
      agent.description = dto.description ?? null;
    if (dto.modelId !== undefined) agent.modelId = dto.modelId;
    if (dto.instruction !== undefined) agent.instruction = dto.instruction;
    if (dto.actionGroups !== undefined) {
      agent.actionGroups = dto.actionGroups;
    }
    if (dto.knowledgeBaseIds !== undefined) {
      agent.knowledgeBaseIds = dto.knowledgeBaseIds;
    }

    return this.agentRepo.save(agent);
  }

  async remove(agentId: string): Promise<void> {
    const agent = await this.agentRepo.findOne({ where: { id: agentId } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    await this.agentRepo.remove(agent);
  }

  async deploy(agentId: string): Promise<Agent> {
    const agent = await this.agentRepo.findOne({ where: { id: agentId } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    agent.status = 'prepared';
    return this.agentRepo.save(agent);
  }

  async invoke(
    agentId: string,
    input: string,
    sessionId?: string,
  ): Promise<{ completion: string; sessionId: string }> {
    const agent = await this.agentRepo.findOne({ where: { id: agentId } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return {
      completion:
        'Agent invocation requires AWS Bedrock Agent runtime. This is a placeholder response.',
      sessionId: sessionId ?? agentId,
    };
  }
}
