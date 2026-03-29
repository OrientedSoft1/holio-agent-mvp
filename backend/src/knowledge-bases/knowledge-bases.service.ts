import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';import { ConfigService } from '@nestjs/config';
import { KnowledgeBase } from './entities/knowledge-base.entity.js';
import { BedrockConfigService } from '../companies/bedrock-config.service.js';

@Injectable()
export class KnowledgeBasesService {
  private readonly logger = new Logger(KnowledgeBasesService.name);

  constructor(
    @InjectRepository(KnowledgeBase)
    private readonly kbRepo: Repository<KnowledgeBase>,
    private readonly bedrockConfigService: BedrockConfigService,
    private readonly configService: ConfigService,
  ) {}

  private async getResolvedCredentials(companyId: string) {
    const companyCredentials =
      await this.bedrockConfigService.getDecryptedCredentials(companyId);

    const globalAccessKey =
      this.configService.get<string>('AWS_BEDROCK_ACCESS_KEY_ID') ||
      this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const globalSecretKey =
      this.configService.get<string>('AWS_BEDROCK_SECRET_ACCESS_KEY') ||
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const globalRegion = this.configService.get<string>('AWS_BEDROCK_REGION', 'us-east-1');

    const accessKeyId = companyCredentials?.accessKeyId ?? globalAccessKey;
    const secretAccessKey = companyCredentials?.secretAccessKey ?? globalSecretKey;
    const region = companyCredentials?.region ?? globalRegion;

    if (!accessKeyId || !secretAccessKey) {
      throw new BadRequestException('AWS credentials are not configured');
    }

    return { accessKeyId, secretAccessKey, region };
  }

  private async getAgentClient(companyId: string) {
    const { accessKeyId, secretAccessKey, region } =
      await this.getResolvedCredentials(companyId);
    const { BedrockAgentClient } =
      await import('@aws-sdk/client-bedrock-agent');
    return new BedrockAgentClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  private async getAgentRuntimeClient(companyId: string) {
    const { accessKeyId, secretAccessKey, region } =
      await this.getResolvedCredentials(companyId);
    const { BedrockAgentRuntimeClient } =
      await import('@aws-sdk/client-bedrock-agent-runtime');
    return {
      client: new BedrockAgentRuntimeClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      }),
      region,
    };
  }

  private async getKbRoleArn(companyId: string): Promise<string> {
    const config = await this.bedrockConfigService.getConfig(companyId);
    const roleArn = config.kbRoleArn || this.configService.get<string>('KB_ROLE_ARN');
    if (!roleArn) {
      throw new BadRequestException(
        'Knowledge Base Role ARN is not configured. Set KB_ROLE_ARN in the environment or in company Bedrock settings.',
      );
    }
    return roleArn;
  }

  private async getAossConfig(companyId: string): Promise<{ collectionArn: string; indexName: string }> {
    const config = await this.bedrockConfigService.getConfig(companyId);
    const collectionArn =
      config.aossCollectionArn ||
      this.configService.get<string>('AOSS_COLLECTION_ARN');
    if (!collectionArn) {
      throw new BadRequestException(
        'OpenSearch Serverless collection ARN is not configured. ' +
        'Create an AOSS collection in AWS, then set AOSS_COLLECTION_ARN in the environment or in company Bedrock settings.',
      );
    }
    const indexName =
      config.aossIndexName ||
      this.configService.get<string>('AOSS_INDEX_NAME', 'bedrock-kb-index');
    return { collectionArn, indexName };
  }

  async create(
    companyId: string,
    userId: string,
    dto: { name: string; description?: string; s3BucketName: string },
  ) {
    const client = await this.getAgentClient(companyId);
    const { region } = await this.getResolvedCredentials(companyId);

    const kbRoleArn = await this.getKbRoleArn(companyId);
    const { collectionArn, indexName } = await this.getAossConfig(companyId);

    const s3BucketArn = `arn:aws:s3:::${dto.s3BucketName}`;
    const embeddingModelArn = `arn:aws:bedrock:${region}::foundation-model/amazon.titan-embed-text-v2:0`;

    const {
      CreateKnowledgeBaseCommand,
      CreateDataSourceCommand,
      StartIngestionJobCommand,
    } = await import('@aws-sdk/client-bedrock-agent');

    let kbId: string | undefined;
    try {
      const kbResult = await client.send(
        new CreateKnowledgeBaseCommand({
          name: dto.name,
          description: dto.description,
          roleArn: kbRoleArn,
          knowledgeBaseConfiguration: {
            type: 'VECTOR',
            vectorKnowledgeBaseConfiguration: {
              embeddingModelArn,
            },
          },
          storageConfiguration: {
            type: 'OPENSEARCH_SERVERLESS',
            opensearchServerlessConfiguration: {
              collectionArn,
              vectorIndexName: indexName,
              fieldMapping: {
                vectorField: 'embedding',
                textField: 'text',
                metadataField: 'metadata',
              },
            },
          },
        }),
      );
      kbId = kbResult.knowledgeBase?.knowledgeBaseId;
    } catch (error: unknown) {
      const awsError = error as { name?: string; message?: string };
      this.logger.error(`Failed to create KB in Bedrock: ${awsError.message}`);

      if (awsError.name === 'AccessDeniedException') {
        throw new BadRequestException(
          'AWS access denied. The configured IAM user needs iam:PassRole permission for the Knowledge Base role, ' +
          'plus bedrock:CreateKnowledgeBase permission.',
        );
      }
      if (awsError.name === 'ValidationException') {
        throw new BadRequestException(
          `AWS validation error: ${awsError.message}`,
        );
      }
      throw new BadRequestException(
        `Failed to create knowledge base: ${awsError.message ?? 'Unknown AWS error'}`,
      );
    }

    if (!kbId) throw new BadRequestException('Failed to create knowledge base - no ID returned');

    let dataSourceId: string | undefined;
    try {
      const dsResult = await client.send(
        new CreateDataSourceCommand({
          knowledgeBaseId: kbId,
          name: `${dto.name}-s3`,
          dataSourceConfiguration: {
            type: 'S3',
            s3Configuration: { bucketArn: s3BucketArn } as never,
          },
        }),
      );
      dataSourceId = dsResult.dataSource?.dataSourceId;

      if (dataSourceId) {
        await client.send(
          new StartIngestionJobCommand({
            knowledgeBaseId: kbId,
            dataSourceId,
          }),
        );
      }
    } catch (error) {
      this.logger.warn(`Data source creation/ingestion failed for KB ${kbId}: ${error}`);
    }

    const local = this.kbRepo.create({
      companyId,
      name: dto.name,
      description: dto.description ?? null,
      bedrockKbId: kbId,
      dataSourceId: dataSourceId ?? null,
      status: 'CREATING',
      createdBy: userId,
    });
    await this.kbRepo.save(local);

    return {
      knowledgeBaseId: kbId,
      name: dto.name,
      description: dto.description ?? null,
      status: 'CREATING',
      updatedAt: new Date().toISOString(),
    };
  }

  async findAll(companyId: string) {
    try {
      const { accessKeyId, secretAccessKey, region } =
        await this.getResolvedCredentials(companyId);

      const { BedrockAgentClient } = await import('@aws-sdk/client-bedrock-agent');
      const client = new BedrockAgentClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });
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
    } catch (error) {
      this.logger.warn(`Failed to list KBs from Bedrock for company ${companyId}: ${error}`);
      try {
        const local = await this.kbRepo.find({
          where: { companyId },
          order: { createdAt: 'DESC' },
        });
        return local.map((kb) => ({
          knowledgeBaseId: kb.bedrockKbId ?? kb.id,
          name: kb.name,
          description: kb.description,
          status: kb.status?.toUpperCase() ?? 'ACTIVE',
          updatedAt: kb.updatedAt?.toISOString() ?? new Date().toISOString(),
        }));
      } catch {
        return [];
      }
    }
  }

  async getOne(companyId: string, kbId: string) {
    try {
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
    } catch (error) {
      this.logger.warn(`Failed to get KB ${kbId} from Bedrock: ${error}`);
      throw new NotFoundException('Knowledge base not found');
    }
  }

  async query(companyId: string, kbId: string, queryText: string, maxResults = 5) {
    const { client } = await this.getAgentRuntimeClient(companyId);
    const { RetrieveCommand } =
      await import('@aws-sdk/client-bedrock-agent-runtime');
    const result = await client.send(
      new RetrieveCommand({
        knowledgeBaseId: kbId,
        retrievalQuery: { text: queryText },
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

  async ragQuery(companyId: string, kbId: string, queryText: string, modelId?: string) {
    const { client, region } = await this.getAgentRuntimeClient(companyId);
    const { RetrieveAndGenerateCommand } =
      await import('@aws-sdk/client-bedrock-agent-runtime');
    const model = modelId ?? 'anthropic.claude-sonnet-4-20250514-v1:0';
    const modelArn = `arn:aws:bedrock:${region}::foundation-model/${model}`;

    const result = await client.send(
      new RetrieveAndGenerateCommand({
        input: { text: queryText },
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

  async sync(companyId: string, kbId: string) {
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

  async remove(companyId: string, kbId: string) {
    try {
      const client = await this.getAgentClient(companyId);
      const { DeleteKnowledgeBaseCommand } =
        await import('@aws-sdk/client-bedrock-agent');
      await client.send(
        new DeleteKnowledgeBaseCommand({ knowledgeBaseId: kbId }),
      );
    } catch (error) {
      this.logger.warn(`Failed to delete KB ${kbId} from Bedrock: ${error}`);
    }
    const local = await this.kbRepo.findOne({
      where: { companyId, bedrockKbId: kbId },
    });
    if (local) {
      await this.kbRepo.remove(local);
    }
    return { message: 'Knowledge base deleted' };
  }
}
