import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BedrockConfigService } from '../companies/bedrock-config.service.js';
import { GeminiConfigService } from '../companies/gemini-config.service.js';
import { GeminiService } from '../bots/gemini.service.js';
import { ImageGeneration } from './entities/image-generation.entity.js';

interface ImageGenResponse {
  images?: string[];
}

@Injectable()
export class ImageGenService {
  private readonly logger = new Logger(ImageGenService.name);

  constructor(
    @InjectRepository(ImageGeneration)
    private readonly imageGenRepo: Repository<ImageGeneration>,
    private readonly bedrockConfigService: BedrockConfigService,
    private readonly geminiConfigService: GeminiConfigService,
    private readonly geminiService: GeminiService,
    private readonly configService: ConfigService,
  ) {}

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

  async generateImage(
    companyId: string,
    userId: string,
    dto: {
      prompt: string;
      negativePrompt?: string;
      width?: number;
      height?: number;
      cfgScale?: number;
      seed?: number;
      provider?: 'bedrock' | 'gemini';
    },
  ) {
    const provider = dto.provider ?? 'bedrock';
    const width = dto.width ?? 1024;
    const height = dto.height ?? 1024;

    if (provider === 'gemini') {
      return this.generateImageGemini(companyId, userId, dto, width, height);
    }

    return this.generateImageBedrock(companyId, userId, dto, width, height);
  }

  private async generateImageBedrock(
    companyId: string,
    userId: string,
    dto: {
      prompt: string;
      negativePrompt?: string;
      cfgScale?: number;
      seed?: number;
    },
    width: number,
    height: number,
  ) {
    const client = await this.getRuntimeClient(companyId);
    const { InvokeModelCommand } =
      await import('@aws-sdk/client-bedrock-runtime');

    const response = await client.send(
      new InvokeModelCommand({
        modelId: 'amazon.nova-canvas-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          taskType: 'TEXT_IMAGE',
          textToImageParams: {
            text: dto.prompt,
            ...(dto.negativePrompt && { negativeText: dto.negativePrompt }),
          },
          imageGenerationConfig: {
            numberOfImages: 1,
            width,
            height,
            cfgScale: dto.cfgScale ?? 8.0,
            seed: dto.seed ?? 0,
          },
        }),
      }),
    );

    const result = JSON.parse(
      new TextDecoder().decode(response.body),
    ) as ImageGenResponse;
    const base64Image: string = result.images?.[0] ?? '';

    const imageUrl = `data:image/png;base64,${base64Image}`;

    const generation = this.imageGenRepo.create({
      companyId,
      userId,
      prompt: dto.prompt,
      negativePrompt: dto.negativePrompt ?? null,
      taskType: 'TEXT_IMAGE',
      resultUrl: imageUrl,
      width,
      height,
      params: { cfgScale: dto.cfgScale ?? 8, seed: dto.seed ?? 0, provider: 'bedrock' },
    });
    const saved = await this.imageGenRepo.save(generation);

    return { imageUrl, generation: saved };
  }

  private async generateImageGemini(
    companyId: string,
    userId: string,
    dto: {
      prompt: string;
      negativePrompt?: string;
    },
    width: number,
    height: number,
  ) {
    const companyCreds =
      await this.geminiConfigService.getDecryptedApiKey(companyId);
    const globalKey = this.configService.get<string>('GEMINI_API_KEY');
    const apiKey = companyCreds?.apiKey ?? globalKey;

    if (!apiKey) {
      throw new BadRequestException(
        'Gemini API key not configured. Please add it in company settings.',
      );
    }

    const result = await this.geminiService.generateImage({
      prompt: dto.prompt,
      negativePrompt: dto.negativePrompt,
      width,
      height,
      apiKey,
    });

    const imageUrl = `data:image/png;base64,${result.imageBase64}`;

    const generation = this.imageGenRepo.create({
      companyId,
      userId,
      prompt: dto.prompt,
      negativePrompt: dto.negativePrompt ?? null,
      taskType: 'TEXT_IMAGE',
      resultUrl: imageUrl,
      width,
      height,
      params: { provider: 'gemini' },
    });
    const saved = await this.imageGenRepo.save(generation);

    return { imageUrl, generation: saved };
  }

  async removeBackground(
    companyId: string,
    userId: string,
    imageBase64: string,
  ) {
    const client = await this.getRuntimeClient(companyId);
    const { InvokeModelCommand } =
      await import('@aws-sdk/client-bedrock-runtime');

    const response = await client.send(
      new InvokeModelCommand({
        modelId: 'amazon.nova-canvas-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          taskType: 'BACKGROUND_REMOVAL',
          backgroundRemovalParams: {
            image: { source: { bytes: imageBase64 } },
          },
        }),
      }),
    );

    const result = JSON.parse(
      new TextDecoder().decode(response.body),
    ) as ImageGenResponse;
    const base64Result: string = result.images?.[0] ?? '';
    const imageUrl = `data:image/png;base64,${base64Result}`;

    const generation = this.imageGenRepo.create({
      companyId,
      userId,
      prompt: 'Background removal',
      negativePrompt: null,
      taskType: 'BACKGROUND_REMOVAL',
      resultUrl: imageUrl,
      width: 0,
      height: 0,
      params: {},
    });
    const saved = await this.imageGenRepo.save(generation);

    return { imageUrl, generation: saved };
  }

  async getHistory(companyId: string) {
    return this.imageGenRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
