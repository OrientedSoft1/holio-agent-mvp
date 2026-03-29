import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from './entities/integration.entity.js';
import {
  CreateIntegrationDto,
  UpdateIntegrationDto,
} from './dto/integration.dto.js';

const DEFAULT_INTEGRATIONS: Omit<
  CreateIntegrationDto & {
    category: string;
    icon: string;
    configurable: boolean;
  },
  never
>[] = [
  {
    type: 'bedrock',
    name: 'AWS Bedrock',
    description:
      'Connect to Amazon Bedrock foundation models for AI-powered conversations.',
    icon: '🤖',
    category: 'AI & Models',
    configurable: true,
  },
  {
    type: 'openai',
    name: 'OpenAI',
    description: 'Integrate OpenAI GPT models as an alternative AI provider.',
    icon: '🧠',
    category: 'AI & Models',
    configurable: true,
  },
  {
    type: 'webhooks',
    name: 'Webhooks',
    description:
      'Send and receive real-time event notifications via HTTP webhooks.',
    icon: '🔗',
    category: 'Automation',
    configurable: true,
  },
  {
    type: 'apikeys',
    name: 'API Keys',
    description: 'Manage API keys for external service access.',
    icon: '🔑',
    category: 'Developer',
    configurable: true,
  },
  {
    type: 'github',
    name: 'GitHub',
    description: 'Link repositories and receive commit and PR notifications.',
    icon: '🐙',
    category: 'Developer',
    configurable: true,
  },
  {
    type: 'gdrive',
    name: 'Google Drive',
    description: 'Share and access Google Drive files directly in chats.',
    icon: '📁',
    category: 'Automation',
    configurable: true,
  },
  {
    type: 'alerts',
    name: 'Cross-Platform Alerts',
    description: 'Forward alerts and notifications across connected platforms.',
    icon: '🔔',
    category: 'Automation',
    configurable: true,
  },
];

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private readonly integrationRepo: Repository<Integration>,
  ) {}

  async findAll(companyId: string): Promise<Integration[]> {
    return this.integrationRepo.find({
      where: { companyId },
      order: { createdAt: 'ASC' },
    });
  }

  async create(
    companyId: string,
    dto: CreateIntegrationDto,
  ): Promise<Integration> {
    const integration = this.integrationRepo.create({
      companyId,
      type: dto.type,
      name: dto.name,
      description: dto.description ?? null,
      icon: dto.icon ?? null,
      category: dto.category ?? null,
      config: dto.config ?? {},
      configurable: dto.configurable ?? false,
    });

    return this.integrationRepo.save(integration);
  }

  async toggle(companyId: string, integrationId: string): Promise<Integration> {
    const integration = await this.integrationRepo.findOne({
      where: { id: integrationId, companyId },
    });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }
    integration.isConnected = !integration.isConnected;
    return this.integrationRepo.save(integration);
  }

  async update(
    companyId: string,
    integrationId: string,
    dto: UpdateIntegrationDto,
  ): Promise<Integration> {
    const integration = await this.integrationRepo.findOne({
      where: { id: integrationId, companyId },
    });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    if (dto.name !== undefined) integration.name = dto.name;
    if (dto.description !== undefined)
      integration.description = dto.description ?? null;
    if (dto.config !== undefined) integration.config = dto.config;
    if (dto.isConnected !== undefined)
      integration.isConnected = dto.isConnected;
    if (dto.icon !== undefined) integration.icon = dto.icon ?? null;

    return this.integrationRepo.save(integration);
  }

  async remove(companyId: string, integrationId: string): Promise<void> {
    const integration = await this.integrationRepo.findOne({
      where: { id: integrationId, companyId },
    });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }
    await this.integrationRepo.remove(integration);
  }

  async seedDefaults(companyId: string): Promise<void> {
    const existing = await this.integrationRepo.count({
      where: { companyId },
    });
    if (existing > 0) return;

    const entities = DEFAULT_INTEGRATIONS.map((def) =>
      this.integrationRepo.create({
        companyId,
        type: def.type,
        name: def.name,
        description: def.description ?? null,
        icon: def.icon ?? null,
        category: def.category ?? null,
        configurable: def.configurable ?? false,
      }),
    );

    await this.integrationRepo.save(entities);
  }
}
