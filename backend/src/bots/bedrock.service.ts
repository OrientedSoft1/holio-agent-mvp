import { Injectable, Logger } from '@nestjs/common';

interface InvokeConfig {
  modelId: string;
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
  region?: string;
}

interface InvokeResult {
  content: string;
  tokensUsed: number;
}

@Injectable()
export class BedrockService {
  private readonly logger = new Logger(BedrockService.name);

  async invokeModel(config: InvokeConfig): Promise<InvokeResult> {
    try {
      const {
        BedrockRuntimeClient,
        ConverseCommand,
      } = await import('@aws-sdk/client-bedrock-runtime');

      const client = new BedrockRuntimeClient({
        region: config.region ?? 'eu-west-1',
      });

      const messages = config.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: [{ text: m.content }],
      }));

      const command = new ConverseCommand({
        modelId: config.modelId,
        system: [{ text: config.systemPrompt }],
        messages,
        inferenceConfig: {
          temperature: config.temperature ?? 0.7,
          maxTokens: config.maxTokens ?? 2048,
        },
      });

      const response = await client.send(command);

      const outputContent =
        response.output?.message?.content?.[0]?.text ?? '';
      const inputTokens = response.usage?.inputTokens ?? 0;
      const outputTokens = response.usage?.outputTokens ?? 0;

      return {
        content: outputContent,
        tokensUsed: inputTokens + outputTokens,
      };
    } catch (error) {
      this.logger.warn(
        `Bedrock invocation failed, returning mock response: ${error}`,
      );
      return this.mockResponse(config);
    }
  }

  async *invokeModelStream(
    config: InvokeConfig,
  ): AsyncGenerator<string, void, undefined> {
    try {
      const {
        BedrockRuntimeClient,
        ConverseStreamCommand,
      } = await import('@aws-sdk/client-bedrock-runtime');

      const client = new BedrockRuntimeClient({
        region: config.region ?? 'eu-west-1',
      });

      const messages = config.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: [{ text: m.content }],
      }));

      const command = new ConverseStreamCommand({
        modelId: config.modelId,
        system: [{ text: config.systemPrompt }],
        messages,
        inferenceConfig: {
          temperature: config.temperature ?? 0.7,
          maxTokens: config.maxTokens ?? 2048,
        },
      });

      const response = await client.send(command);

      if (response.stream) {
        for await (const event of response.stream) {
          if (event.contentBlockDelta?.delta?.text) {
            yield event.contentBlockDelta.delta.text;
          }
        }
      }
    } catch (error) {
      this.logger.warn(
        `Bedrock stream failed, yielding mock response: ${error}`,
      );
      const mock = this.mockResponse(config);
      yield mock.content;
    }
  }

  private mockResponse(config: InvokeConfig): InvokeResult {
    const typeHint = config.systemPrompt.slice(0, 80);
    return {
      content:
        `[Mock Response] I'm an AI agent powered by ${config.modelId}. ` +
        `AWS Bedrock is not configured yet. In production, I would use my ` +
        `capabilities to help with tasks related to: "${typeHint}..."`,
      tokensUsed: 0,
    };
  }
}
