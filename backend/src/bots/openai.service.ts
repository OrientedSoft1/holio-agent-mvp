import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

interface OpenAIInvokeConfig {
  modelId: string;
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
  apiKey: string;
  organizationId?: string;
}

interface InvokeResult {
  content: string;
  tokensUsed: number;
  stopReason?: string;
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);

  async invokeModel(config: OpenAIInvokeConfig): Promise<InvokeResult> {
    try {
      const { default: OpenAI } = await import('openai');

      const client = new OpenAI({
        apiKey: config.apiKey,
        ...(config.organizationId && { organization: config.organizationId }),
      });

      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: config.systemPrompt },
        ...config.messages,
      ];

      const response = await client.chat.completions.create({
        model: config.modelId,
        messages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2048,
      });

      const choice = response.choices[0];
      const inputTokens = response.usage?.prompt_tokens ?? 0;
      const outputTokens = response.usage?.completion_tokens ?? 0;

      return {
        content: choice?.message?.content ?? '',
        tokensUsed: inputTokens + outputTokens,
        stopReason: choice?.finish_reason ?? undefined,
      };
    } catch (error) {
      this.logger.error(`OpenAI invocation failed: ${error}`);
      throw new ServiceUnavailableException(
        'OpenAI service is currently unavailable. Please check your OpenAI API key configuration.',
      );
    }
  }
}
