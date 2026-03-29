import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { BedrockConfigService } from '../companies/bedrock-config.service.js';

interface ContentFilter {
  type: string;
  inputStrength: string;
  outputStrength: string;
}

interface DeniedTopic {
  name: string;
  definition: string;
}

interface SensitiveInfoType {
  type: string;
  action: string;
}

interface CreateGuardrailDto {
  name: string;
  description?: string;
  blockedInputMessaging?: string;
  blockedOutputsMessaging?: string;
  contentFilters?: ContentFilter[];
  deniedTopics?: DeniedTopic[];
  wordFilters?: string[];
  sensitiveInfoTypes?: SensitiveInfoType[];
}

@Injectable()
export class GuardrailsService {
  private readonly logger = new Logger(GuardrailsService.name);

  constructor(private readonly bedrockConfigService: BedrockConfigService) {}

  private async getBedrockClient(companyId: string) {
    const credentials =
      await this.bedrockConfigService.getDecryptedCredentials(companyId);
    if (!credentials) {
      throw new BadRequestException('AWS Bedrock credentials not configured');
    }
    const { BedrockClient } = await import('@aws-sdk/client-bedrock');
    return new BedrockClient({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
  }

  private async getRuntimeClient(companyId: string) {
    const credentials =
      await this.bedrockConfigService.getDecryptedCredentials(companyId);
    if (!credentials) {
      throw new BadRequestException('AWS Bedrock credentials not configured');
    }
    const { BedrockRuntimeClient } =
      await import('@aws-sdk/client-bedrock-runtime');
    return new BedrockRuntimeClient({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
  }

  async listGuardrails(companyId: string) {
    try {
      const client = await this.getBedrockClient(companyId);
      const { ListGuardrailsCommand } = await import('@aws-sdk/client-bedrock');
      const result = await client.send(new ListGuardrailsCommand({}));
      return (result.guardrails ?? []).map((g) => ({
        guardrailId: g.id,
        guardrailArn: g.arn,
        name: g.name,
        description: g.description ?? null,
        status: g.status,
        version: g.version,
        createdAt: g.createdAt?.toISOString() ?? '',
        updatedAt: g.updatedAt?.toISOString() ?? '',
      }));
    } catch (error) {
      this.logger.warn(`Failed to list guardrails for company ${companyId}: ${error}`);
      return [];
    }
  }

  async getGuardrail(companyId: string, guardrailId: string) {
    const client = await this.getBedrockClient(companyId);
    const { GetGuardrailCommand } = await import('@aws-sdk/client-bedrock');
    const g = await client.send(
      new GetGuardrailCommand({
        guardrailIdentifier: guardrailId,
      }),
    );
    return {
      guardrailId: g.guardrailId,
      guardrailArn: g.guardrailArn,
      name: g.name,
      description: g.description ?? null,
      status: g.status,
      version: g.version,
      createdAt: g.createdAt?.toISOString() ?? '',
      updatedAt: g.updatedAt?.toISOString() ?? '',
      blockedInputMessaging: g.blockedInputMessaging ?? '',
      blockedOutputsMessaging: g.blockedOutputsMessaging ?? '',
      contentPolicy: g.contentPolicy,
      topicPolicy: g.topicPolicy,
      wordPolicy: g.wordPolicy,
      sensitiveInformationPolicy: g.sensitiveInformationPolicy,
    };
  }

  async createGuardrail(companyId: string, dto: CreateGuardrailDto) {
    const client = await this.getBedrockClient(companyId);
    const { CreateGuardrailCommand } = await import('@aws-sdk/client-bedrock');

    const input: Record<string, unknown> = {
      name: dto.name,
      description: dto.description,
      blockedInputMessaging:
        dto.blockedInputMessaging ??
        'This request was blocked by content policy.',
      blockedOutputsMessaging:
        dto.blockedOutputsMessaging ??
        'This response was blocked by content policy.',
    };

    if (dto.contentFilters?.length) {
      input.contentPolicyConfig = {
        filtersConfig: dto.contentFilters.map((f) => ({
          type: f.type,
          inputStrength: f.inputStrength,
          outputStrength: f.outputStrength,
        })),
      };
    }

    if (dto.deniedTopics?.length) {
      input.topicPolicyConfig = {
        topicsConfig: dto.deniedTopics.map((t) => ({
          name: t.name,
          definition: t.definition,
          type: 'DENY',
        })),
      };
    }

    if (dto.wordFilters?.length) {
      input.wordPolicyConfig = {
        wordsConfig: dto.wordFilters.map((w) => ({ text: w })),
      };
    }

    if (dto.sensitiveInfoTypes?.length) {
      input.sensitiveInformationPolicyConfig = {
        piiEntitiesConfig: dto.sensitiveInfoTypes.map((s) => ({
          type: s.type,
          action: s.action,
        })),
      };
    }

    const result = await client.send(
      new CreateGuardrailCommand(
        input as unknown as ConstructorParameters<typeof CreateGuardrailCommand>[0],
      ),
    );
    return {
      guardrailId: result.guardrailId,
      guardrailArn: result.guardrailArn,
      name: dto.name,
      description: dto.description ?? null,
      status: 'CREATING',
      version: result.version ?? 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async deleteGuardrail(companyId: string, guardrailId: string) {
    const client = await this.getBedrockClient(companyId);
    const { DeleteGuardrailCommand } = await import('@aws-sdk/client-bedrock');
    await client.send(
      new DeleteGuardrailCommand({
        guardrailIdentifier: guardrailId,
      }),
    );
  }

  async testGuardrail(
    companyId: string,
    guardrailId: string,
    content: string,
    source: 'INPUT' | 'OUTPUT',
  ) {
    const client = await this.getRuntimeClient(companyId);
    const { ApplyGuardrailCommand } =
      await import('@aws-sdk/client-bedrock-runtime');
    const result = await client.send(
      new ApplyGuardrailCommand({
        guardrailIdentifier: guardrailId,
        guardrailVersion: 'DRAFT',
        source,
        content: [{ text: { text: content } }],
      }),
    );
    return {
      action: result.action,
      outputs:
        result.outputs?.map((o) => ({
          text: (o as { text?: string }).text ?? '',
        })) ?? [],
      assessments: result.assessments ?? [],
    };
  }
}
