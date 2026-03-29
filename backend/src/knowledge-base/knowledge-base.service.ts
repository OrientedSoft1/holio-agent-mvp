import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { BedrockConfigService } from '../companies/bedrock-config.service.js';

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);

  constructor(private readonly bedrockConfigService: BedrockConfigService) {}

  private async getAgentClient(companyId: string) {
    const credentials =
      await this.bedrockConfigService.getDecryptedCredentials(companyId);
    if (!credentials) {
      throw new BadRequestException('AWS Bedrock credentials not configured');
    }
    const { BedrockAgentClient } =
      await import('@aws-sdk/client-bedrock-agent');
    return new BedrockAgentClient({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
  }

  private async getAgentRuntimeClient(companyId: string) {
    const credentials =
      await this.bedrockConfigService.getDecryptedCredentials(companyId);
    if (!credentials) {
      throw new BadRequestException('AWS Bedrock credentials not configured');
    }
    const { BedrockAgentRuntimeClient } =
      await import('@aws-sdk/client-bedrock-agent-runtime');
    return {
      client: new BedrockAgentRuntimeClient({
        region: credentials.region,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
        },
      }),
      region: credentials.region,
    };
  }

  async listKnowledgeBases(companyId: string) {
    const client = await this.getAgentClient(companyId);
    const { ListKnowledgeBasesCommand } =
      await import('@aws-sdk/client-bedrock-agent');
    const result = await client.send(new ListKnowledgeBasesCommand({}));
    return (result.knowledgeBaseSummaries ?? []).map((kb) => ({
      knowledgeBaseId: kb.knowledgeBaseId,
      name: kb.name,
      description: kb.description ?? null,
      status: kb.status,
      updatedAt: kb.updatedAt?.toISOString() ?? new Date().toISOString(),
    }));
  }

  async getKnowledgeBase(companyId: string, kbId: string) {
    const client = await this.getAgentClient(companyId);
    const { GetKnowledgeBaseCommand } =
      await import('@aws-sdk/client-bedrock-agent');
    const result = await client.send(
      new GetKnowledgeBaseCommand({ knowledgeBaseId: kbId }),
    );
    const kb = result.knowledgeBase;
    return {
      knowledgeBaseId: kb?.knowledgeBaseId,
      name: kb?.name,
      description: kb?.description ?? null,
      status: kb?.status,
      updatedAt: kb?.updatedAt?.toISOString(),
    };
  }

  async queryKB(
    companyId: string,
    kbId: string,
    query: string,
    maxResults = 5,
  ) {
    const { client } = await this.getAgentRuntimeClient(companyId);
    const { RetrieveCommand } =
      await import('@aws-sdk/client-bedrock-agent-runtime');
    const result = await client.send(
      new RetrieveCommand({
        knowledgeBaseId: kbId,
        retrievalQuery: { text: query },
        retrievalConfiguration: {
          vectorSearchConfiguration: { numberOfResults: maxResults },
        },
      }),
    );
    return {
      results: (result.retrievalResults ?? []).map((r) => ({
        content: r.content?.text ?? '',
        score: r.score ?? 0,
        sourceUri: r.location?.s3Location?.uri,
        metadata: r.metadata as Record<string, string> | undefined,
      })),
    };
  }

  async ragQuery(
    companyId: string,
    kbId: string,
    query: string,
    modelId?: string,
  ) {
    const { client, region } = await this.getAgentRuntimeClient(companyId);
    const { RetrieveAndGenerateCommand } =
      await import('@aws-sdk/client-bedrock-agent-runtime');
    const model = modelId ?? 'anthropic.claude-sonnet-4-20250514-v1:0';
    const modelArn = `arn:aws:bedrock:${region}::foundation-model/${model}`;

    const result = await client.send(
      new RetrieveAndGenerateCommand({
        input: { text: query },
        retrieveAndGenerateConfiguration: {
          type: 'KNOWLEDGE_BASE',
          knowledgeBaseConfiguration: {
            knowledgeBaseId: kbId,
            modelArn,
          },
        },
      }),
    );

    return {
      answer: result.output?.text ?? '',
      citations: (result.citations ?? []).map((c) => ({
        generatedText: c.generatedResponsePart?.textResponsePart?.text ?? '',
        references: (c.retrievedReferences ?? []).map((r) => ({
          sourceUri: r.location?.s3Location?.uri ?? '',
          content: r.content?.text ?? '',
        })),
      })),
    };
  }

  async syncKB(companyId: string, kbId: string) {
    const client = await this.getAgentClient(companyId);
    const { ListDataSourcesCommand, StartIngestionJobCommand } =
      await import('@aws-sdk/client-bedrock-agent');
    const dsResult = await client.send(
      new ListDataSourcesCommand({ knowledgeBaseId: kbId }),
    );
    const dataSources = dsResult.dataSourceSummaries ?? [];
    if (dataSources.length === 0) {
      throw new BadRequestException(
        'No data sources found for this knowledge base',
      );
    }
    await client.send(
      new StartIngestionJobCommand({
        knowledgeBaseId: kbId,
        dataSourceId: dataSources[0].dataSourceId,
      }),
    );
    return { message: 'Ingestion job started' };
  }
}
