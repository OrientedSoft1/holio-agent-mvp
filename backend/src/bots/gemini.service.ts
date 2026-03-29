import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

interface GeminiInvokeConfig {
  modelId: string;
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
  apiKey: string;
}

interface GeminiImageGenConfig {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  apiKey: string;
}

interface InvokeResult {
  content: string;
  tokensUsed: number;
  stopReason?: string;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  async invokeModel(config: GeminiInvokeConfig): Promise<InvokeResult> {
    try {
      const { GoogleGenAI } = await import('@google/genai');

      const ai = new GoogleGenAI({ apiKey: config.apiKey });

      const contents = config.messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : ('user' as const),
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: config.modelId,
        contents,
        config: {
          systemInstruction: config.systemPrompt,
          temperature: config.temperature ?? 0.7,
          maxOutputTokens: config.maxTokens ?? 2048,
        },
      });

      const text = response.text ?? '';
      const usage = response.usageMetadata;
      const tokensUsed =
        (usage?.promptTokenCount ?? 0) +
        (usage?.candidatesTokenCount ?? 0);

      return {
        content: text,
        tokensUsed,
        stopReason: response.candidates?.[0]?.finishReason ?? undefined,
      };
    } catch (error) {
      this.logger.error(`Gemini invocation failed: ${error}`);
      throw new ServiceUnavailableException(
        'Gemini service is currently unavailable. Please check your Gemini API key configuration.',
      );
    }
  }

  async generateImage(
    config: GeminiImageGenConfig,
  ): Promise<{ imageBase64: string }> {
    try {
      const { GoogleGenAI } = await import('@google/genai');

      const ai = new GoogleGenAI({ apiKey: config.apiKey });

      const prompt = config.negativePrompt
        ? `${config.prompt}. Avoid: ${config.negativePrompt}`
        : config.prompt;

      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
          numberOfImages: 1,
          ...(config.width &&
            config.height && {
              aspectRatio: this.getAspectRatio(config.width, config.height),
            }),
        },
      });

      const images = response.generatedImages;
      if (!images || images.length === 0) {
        throw new Error('No images generated');
      }

      const imageBytes = images[0].image?.imageBytes;
      if (!imageBytes) {
        throw new Error('No image bytes in response');
      }

      const imageBase64 =
        typeof imageBytes === 'string'
          ? imageBytes
          : Buffer.from(imageBytes).toString('base64');

      return { imageBase64 };
    } catch (error) {
      this.logger.error(`Gemini image generation failed: ${error}`);
      throw new ServiceUnavailableException(
        'Gemini image generation is currently unavailable. Please check your Gemini API key configuration.',
      );
    }
  }

  private getAspectRatio(width: number, height: number): string {
    const ratio = width / height;
    if (ratio >= 1.7) return '16:9';
    if (ratio >= 1.2) return '4:3';
    if (ratio <= 0.6) return '9:16';
    if (ratio <= 0.85) return '3:4';
    return '1:1';
  }
}
