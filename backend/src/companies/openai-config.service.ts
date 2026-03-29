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
import { UpdateOpenAIConfigDto } from './dto/openai-config.dto.js';

export interface SanitizedOpenAIConfig {
  apiKeyHint?: string;
  organizationId?: string;
  defaultModelId?: string;
  isConfigured: boolean;
}

const ENCRYPTION_ALGO = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

@Injectable()
export class OpenAIConfigService {
  private readonly logger = new Logger(OpenAIConfigService.name);
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

  async getConfig(companyId: string): Promise<SanitizedOpenAIConfig> {
    const company = await this.companyRepo.findOneOrFail({
      where: { id: companyId },
    });

    const cfg = company.openaiConfig;
    const hasKey = !!cfg?.apiKey;

    return {
      apiKeyHint: hasKey
        ? `sk-****${this.decrypt(cfg!.apiKey!).slice(-4)}`
        : undefined,
      organizationId: cfg?.organizationId,
      defaultModelId: cfg?.defaultModelId,
      isConfigured: hasKey,
    };
  }

  async getDecryptedApiKey(
    companyId: string,
  ): Promise<{ apiKey: string; organizationId?: string } | null> {
    const company = await this.companyRepo.findOneOrFail({
      where: { id: companyId },
    });

    const cfg = company.openaiConfig;
    if (!cfg?.apiKey) return null;

    return {
      apiKey: this.decrypt(cfg.apiKey),
      organizationId: cfg.organizationId,
    };
  }

  async updateConfig(
    companyId: string,
    dto: UpdateOpenAIConfigDto,
  ): Promise<SanitizedOpenAIConfig> {
    const company = await this.companyRepo.findOneOrFail({
      where: { id: companyId },
    });

    const existing = company.openaiConfig ?? {};

    const updated: typeof company.openaiConfig = {
      ...existing,
      ...(dto.apiKey !== undefined && { apiKey: this.encrypt(dto.apiKey) }),
      ...(dto.organizationId !== undefined && {
        organizationId: dto.organizationId,
      }),
      ...(dto.defaultModelId !== undefined && {
        defaultModelId: dto.defaultModelId,
      }),
    };

    company.openaiConfig = updated;
    await this.companyRepo.save(company);

    return this.getConfig(companyId);
  }

  async validateApiKey(
    apiKey: string,
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const { default: OpenAI } = await import('openai');
      const client = new OpenAI({ apiKey });
      const models = await client.models.list();
      const count = Array.isArray(models.data) ? models.data.length : 0;
      return { valid: true, error: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`OpenAI API key validation failed: ${message}`);
      return { valid: false, error: message };
    }
  }
}
