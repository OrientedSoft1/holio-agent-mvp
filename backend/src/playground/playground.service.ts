import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BedrockService } from '../bots/bedrock.service.js';
import { OpenAIService } from '../bots/openai.service.js';
import { GeminiService } from '../bots/gemini.service.js';
import { BedrockConfigService } from '../companies/bedrock-config.service.js';
import { OpenAIConfigService } from '../companies/openai-config.service.js';
import { GeminiConfigService } from '../companies/gemini-config.service.js';
import { PlaygroundPreset } from './entities/playground-preset.entity.js';
import {
  InvokePlaygroundDto,
  CreatePresetDto,
} from './dto/invoke-playground.dto.js';

const OPENAI_MODEL_PREFIXES = ['gpt-', 'o1-', 'o3-', 'o4-', 'chatgpt-'];
const GEMINI_MODEL_PREFIXES = ['gemini-'];

@Injectable()
export class PlaygroundService {
  private readonly logger = new Logger(PlaygroundService.name);

  constructor(
    @InjectRepository(PlaygroundPreset)
    private readonly presetRepo: Repository<PlaygroundPreset>,
    private readonly bedrockService: BedrockService,
    private readonly openaiService: OpenAIService,
    private readonly geminiService: GeminiService,
    private readonly bedrockConfigService: BedrockConfigService,
    private readonly openaiConfigService: OpenAIConfigService,
    private readonly geminiConfigService: GeminiConfigService,
    private readonly configService: ConfigService,
  ) {}

  private isOpenAIModel(modelId: string): boolean {
    return OPENAI_MODEL_PREFIXES.some((p) => modelId.startsWith(p));
  }

  private isGeminiModel(modelId: string): boolean {
    return GEMINI_MODEL_PREFIXES.some((p) => modelId.startsWith(p));
  }

  async invoke(companyId: string, dto: InvokePlaygroundDto) {
    try {
      if (this.isGeminiModel(dto.modelId)) {
        return await this.invokeGemini(companyId, dto);
      }
      if (this.isOpenAIModel(dto.modelId)) {
        return await this.invokeOpenAI(companyId, dto);
      }
      return await this.invokeBedrock(companyId, dto);
    } catch (error) {
      this.logger.error(`Playground invoke failed: ${error}`);
      return {
        content:
          'AI service is currently unavailable. Please check your AI configuration in company settings.',
        tokensUsed: 0,
      };
    }
  }

  private async invokeOpenAI(companyId: string, dto: InvokePlaygroundDto) {
    const companyCreds =
      await this.openaiConfigService.getDecryptedApiKey(companyId);
    const globalKey = this.configService.get<string>('OPENAI_API_KEY');

    const apiKey = companyCreds?.apiKey ?? globalKey;
    if (!apiKey) {
      return {
        content:
          'OpenAI is not configured. Please add an OpenAI API key in company settings or set OPENAI_API_KEY in the environment.',
        tokensUsed: 0,
      };
    }

    const result = await this.openaiService.invokeModel({
      modelId: dto.modelId,
      systemPrompt: dto.systemPrompt,
      messages: dto.messages,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
      apiKey,
      organizationId: companyCreds?.organizationId,
    });

    return {
      content: result.content,
      tokensUsed: result.tokensUsed,
      stopReason: result.stopReason,
    };
  }

  private async invokeGemini(companyId: string, dto: InvokePlaygroundDto) {
    const companyCreds =
      await this.geminiConfigService.getDecryptedApiKey(companyId);
    const globalKey = this.configService.get<string>('GEMINI_API_KEY');

    const apiKey = companyCreds?.apiKey ?? globalKey;
    if (!apiKey) {
      return {
        content:
          'Gemini is not configured. Please add a Gemini API key in company settings or set GEMINI_API_KEY in the environment.',
        tokensUsed: 0,
      };
    }

    const result = await this.geminiService.invokeModel({
      modelId: dto.modelId,
      systemPrompt: dto.systemPrompt,
      messages: dto.messages,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
      apiKey,
    });

    return {
      content: result.content,
      tokensUsed: result.tokensUsed,
      stopReason: result.stopReason,
    };
  }

  private async invokeBedrock(companyId: string, dto: InvokePlaygroundDto) {
    const companyCredentials =
      await this.bedrockConfigService.getDecryptedCredentials(companyId);
    const guardrail =
      await this.bedrockConfigService.getGuardrailConfig(companyId);

    const globalAccessKey =
      this.configService.get<string>('AWS_BEDROCK_ACCESS_KEY_ID') ||
      this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const globalSecretKey =
      this.configService.get<string>('AWS_BEDROCK_SECRET_ACCESS_KEY') ||
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const globalRegion = this.configService.get<string>('AWS_BEDROCK_REGION', 'us-east-1');

    const credentials = companyCredentials
      ? {
          accessKeyId: companyCredentials.accessKeyId,
          secretAccessKey: companyCredentials.secretAccessKey,
        }
      : globalAccessKey && globalSecretKey
        ? { accessKeyId: globalAccessKey, secretAccessKey: globalSecretKey }
        : undefined;

    const region = companyCredentials?.region ?? globalRegion;

    const result = await this.bedrockService.invokeModel({
      modelId: dto.modelId,
      systemPrompt: dto.systemPrompt,
      messages: dto.messages,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
      region,
      credentials,
      guardrailConfig: guardrail
        ? {
            guardrailIdentifier: guardrail.guardrailId!,
            guardrailVersion: guardrail.guardrailVersion!,
          }
        : undefined,
    });

    return {
      content: result.content,
      tokensUsed: result.tokensUsed,
      stopReason: result.stopReason,
    };
  }

  async getPresets(
    companyId: string,
    userId: string,
  ): Promise<PlaygroundPreset[]> {
    return this.presetRepo.find({
      where: { companyId, userId },
      order: { createdAt: 'DESC' },
    });
  }

  async createPreset(
    companyId: string,
    userId: string,
    dto: CreatePresetDto,
  ): Promise<PlaygroundPreset> {
    const preset = this.presetRepo.create({
      companyId,
      userId,
      name: dto.name,
      systemPrompt: dto.systemPrompt,
      modelId: dto.modelId,
      temperature: dto.temperature ?? 0.7,
      maxTokens: dto.maxTokens ?? 2048,
    });
    return this.presetRepo.save(preset);
  }

  async deletePreset(
    companyId: string,
    userId: string,
    presetId: string,
  ): Promise<void> {
    const preset = await this.presetRepo.findOne({
      where: { id: presetId, companyId, userId },
    });
    if (!preset) {
      throw new NotFoundException(
        'Preset not found or not owned by current user',
      );
    }
    await this.presetRepo.remove(preset);
  }
}
