import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';
import { Company } from './entities/company.entity.js';
import { UpdateBedrockConfigDto } from './dto/bedrock-config.dto.js';

export interface BedrockModel {
  modelId: string;
  modelName: string;
  provider: string;
  inputModalities: string[];
  outputModalities: string[];
}

export interface SanitizedBedrockConfig {
  accessKeyId?: string;
  secretAccessKeyHint?: string;
  region: string;
  allowedModels?: string[];
  guardrailId?: string;
  guardrailVersion?: string;
  defaultModelId?: string;
  maxTokensBudget?: number;
  kbRoleArn?: string;
  aossCollectionArn?: string;
  aossIndexName?: string;
  isConfigured: boolean;
}

const ENCRYPTION_ALGO = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

@Injectable()
export class BedrockConfigService {
  private readonly logger = new Logger(BedrockConfigService.name);
  private readonly encryptionKey: Buffer;

  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private readonly configService: ConfigService,
  ) {
    const secret = this.configService.get<string>(
      'BEDROCK_ENCRYPTION_KEY',
      'holio-bedrock-default-key-change-me',
    );
    this.encryptionKey = scryptSync(secret, 'holio-salt', 32);
  }

  private encrypt(text: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ENCRYPTION_ALGO, this.encryptionKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  private decrypt(encryptedBase64: string): string {
    const buf = Buffer.from(encryptedBase64, 'base64');
    const iv = buf.subarray(0, IV_LENGTH);
    const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = createDecipheriv(ENCRYPTION_ALGO, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    return (
      decipher.update(encrypted).toString('utf-8') + decipher.final('utf8')
    );
  }

  async getConfig(companyId: string): Promise<SanitizedBedrockConfig> {
    const company = await this.companyRepo.findOneOrFail({
      where: { id: companyId },
    });

    const cfg = company.bedrockConfig;
    const hasCredentials = !!(cfg?.accessKeyId && cfg?.secretAccessKey);

    return {
      accessKeyId: cfg?.accessKeyId,
      secretAccessKeyHint: cfg?.secretAccessKey
        ? `****${this.decrypt(cfg.secretAccessKey).slice(-4)}`
        : undefined,
      region: company.bedrockRegion,
      allowedModels: cfg?.allowedModels,
      guardrailId: cfg?.guardrailId,
      guardrailVersion: cfg?.guardrailVersion,
      defaultModelId: cfg?.defaultModelId,
      maxTokensBudget: cfg?.maxTokensBudget,
      kbRoleArn: cfg?.kbRoleArn,
      aossCollectionArn: cfg?.aossCollectionArn,
      aossIndexName: cfg?.aossIndexName,
      isConfigured: hasCredentials,
    };
  }

  async getDecryptedCredentials(companyId: string): Promise<{
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  } | null> {
    const company = await this.companyRepo.findOneOrFail({
      where: { id: companyId },
    });

    const cfg = company.bedrockConfig;
    if (!cfg?.accessKeyId || !cfg?.secretAccessKey) {
      return null;
    }

    return {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: this.decrypt(cfg.secretAccessKey),
      region: company.bedrockRegion,
    };
  }

  async updateConfig(
    companyId: string,
    dto: UpdateBedrockConfigDto,
  ): Promise<SanitizedBedrockConfig> {
    const company = await this.companyRepo.findOneOrFail({
      where: { id: companyId },
    });

    const existing = company.bedrockConfig ?? {};

    if (dto.region) {
      company.bedrockRegion = dto.region;
    }

    const updated: typeof company.bedrockConfig = {
      ...existing,
      ...(dto.accessKeyId !== undefined && { accessKeyId: dto.accessKeyId }),
      ...(dto.secretAccessKey !== undefined && {
        secretAccessKey: this.encrypt(dto.secretAccessKey),
      }),
      ...(dto.allowedModels !== undefined && {
        allowedModels: dto.allowedModels,
      }),
      ...(dto.guardrailId !== undefined && { guardrailId: dto.guardrailId }),
      ...(dto.guardrailVersion !== undefined && {
        guardrailVersion: dto.guardrailVersion,
      }),
      ...(dto.defaultModelId !== undefined && {
        defaultModelId: dto.defaultModelId,
      }),
      ...(dto.maxTokensBudget !== undefined && {
        maxTokensBudget: dto.maxTokensBudget,
      }),
      ...(dto.kbRoleArn !== undefined && {
        kbRoleArn: dto.kbRoleArn,
      }),
      ...(dto.aossCollectionArn !== undefined && {
        aossCollectionArn: dto.aossCollectionArn,
      }),
      ...(dto.aossIndexName !== undefined && {
        aossIndexName: dto.aossIndexName,
      }),
    };

    company.bedrockConfig = updated;
    await this.companyRepo.save(company);

    return this.getConfig(companyId);
  }

  async validateCredentials(
    accessKeyId: string,
    secretAccessKey: string,
    region = 'eu-west-1',
  ): Promise<{ valid: boolean; modelCount?: number; error?: string }> {
    try {
      const { BedrockClient, ListFoundationModelsCommand } =
        await import('@aws-sdk/client-bedrock');

      const client = new BedrockClient({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const result = await client.send(new ListFoundationModelsCommand({}));
      const count = result.modelSummaries?.length ?? 0;

      return { valid: true, modelCount: count };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Bedrock credential validation failed: ${message}`);
      return { valid: false, error: message };
    }
  }

  async listModels(companyId: string): Promise<BedrockModel[]> {
    const companyCredentials = await this.getDecryptedCredentials(companyId);

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
      throw new BadRequestException(
        'AWS Bedrock credentials are not configured for this workspace',
      );
    }

    try {
      const { BedrockClient, ListFoundationModelsCommand } =
        await import('@aws-sdk/client-bedrock');

      const client = new BedrockClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });

      const result = await client.send(new ListFoundationModelsCommand({}));

      return (result.modelSummaries ?? [])
        .filter((m) => m.modelId && m.modelName)
        .map((m) => ({
          modelId: m.modelId!,
          modelName: m.modelName!,
          provider: m.providerName ?? 'Unknown',
          inputModalities: m.inputModalities ?? [],
          outputModalities: m.outputModalities ?? [],
        }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to list Bedrock models: ${message}`);
      throw new BadRequestException(`Failed to list models: ${message}`);
    }
  }

  async getGuardrailConfig(
    companyId: string,
  ): Promise<{ guardrailId?: string; guardrailVersion?: string } | null> {
    const company = await this.companyRepo.findOneOrFail({
      where: { id: companyId },
    });
    const cfg = company.bedrockConfig;
    if (!cfg?.guardrailId) return null;
    return {
      guardrailId: cfg.guardrailId,
      guardrailVersion: cfg.guardrailVersion ?? 'DRAFT',
    };
  }
}
