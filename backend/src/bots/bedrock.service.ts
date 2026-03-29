import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

interface InvokeConfig {
  modelId: string;
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  guardrailConfig?: {
    guardrailIdentifier: string;
    guardrailVersion: string;
  };
}

interface InvokeResult {
  content: string;
  tokensUsed: number;
  stopReason?: string;
}

const REGION_PREFIX_MAP: Record<string, string> = {
  'us-east-1': 'us',
  'us-west-2': 'us',
  'eu-west-1': 'eu',
  'eu-central-1': 'eu',
  'ap-northeast-1': 'jp',
  'ap-southeast-2': 'au',
  'ap-south-1': 'apac',
  'ap-southeast-1': 'apac',
};

const INFERENCE_PROFILE_MODELS = [
  'anthropic.claude-sonnet-4-6',
  'anthropic.claude-sonnet-4-20250514-v1:0',
  'anthropic.claude-sonnet-4-5-20250929-v1:0',
  'anthropic.claude-opus-4-20250514-v1:0',
  'anthropic.claude-haiku-4-5-20251001-v1:0',
];

@Injectable()
export class BedrockService {
  private readonly logger = new Logger(BedrockService.name);

  private resolveModelId(modelId: string, region: string): string {
    if (modelId.includes('.') && modelId.split('.')[0].match(/^(us|eu|ap|jp|au|apac|global)$/)) {
      return modelId;
    }
    if (INFERENCE_PROFILE_MODELS.includes(modelId)) {
      const prefix = REGION_PREFIX_MAP[region] ?? 'us';
      return `${prefix}.${modelId}`;
    }
    return modelId;
  }

  async invokeModel(config: InvokeConfig): Promise<InvokeResult> {
    try {
      const { BedrockRuntimeClient, ConverseCommand } =
        await import('@aws-sdk/client-bedrock-runtime');
      type ConverseCommandInput = ConstructorParameters<
        typeof ConverseCommand
      >[0];

      const clientOptions: Record<string, unknown> = {
        region: config.region ?? 'eu-west-1',
      };
      if (config.credentials) {
        clientOptions.credentials = {
          accessKeyId: config.credentials.accessKeyId,
          secretAccessKey: config.credentials.secretAccessKey,
        };
      }

      const client = new BedrockRuntimeClient(clientOptions);

      const resolvedModelId = this.resolveModelId(
        config.modelId,
        config.region ?? 'eu-west-1',
      );

      const messages = config.messages.map((m) => ({
        role: m.role,
        content: [{ text: m.content }],
      }));

      const commandInput: ConverseCommandInput = {
        modelId: resolvedModelId,
        system: [{ text: config.systemPrompt }],
        messages,
        inferenceConfig: {
          temperature: config.temperature ?? 0.7,
          maxTokens: config.maxTokens ?? 2048,
        },
      };

      if (config.guardrailConfig) {
        commandInput.guardrailConfig = {
          guardrailIdentifier: config.guardrailConfig.guardrailIdentifier,
          guardrailVersion: config.guardrailConfig.guardrailVersion,
        };
      }

      const command = new ConverseCommand(commandInput);
      const response = await client.send(command);

      const outputContent = response.output?.message?.content?.[0]?.text ?? '';
      const inputTokens = response.usage?.inputTokens ?? 0;
      const outputTokens = response.usage?.outputTokens ?? 0;

      return {
        content: outputContent,
        tokensUsed: inputTokens + outputTokens,
        stopReason: response.stopReason,
      };
    } catch (error) {
      this.logger.error(`Bedrock invocation failed: ${error}`);
      throw new ServiceUnavailableException(
        'AI service is currently unavailable. Please check your AWS Bedrock configuration.',
      );
    }
  }

  async *invokeModelStream(
    config: InvokeConfig,
  ): AsyncGenerator<string, void, undefined> {
    try {
      const { BedrockRuntimeClient, ConverseStreamCommand } =
        await import('@aws-sdk/client-bedrock-runtime');
      type ConverseStreamCommandInput = ConstructorParameters<
        typeof ConverseStreamCommand
      >[0];

      const clientOptions: Record<string, unknown> = {
        region: config.region ?? 'eu-west-1',
      };
      if (config.credentials) {
        clientOptions.credentials = {
          accessKeyId: config.credentials.accessKeyId,
          secretAccessKey: config.credentials.secretAccessKey,
        };
      }

      const client = new BedrockRuntimeClient(clientOptions);

      const resolvedModelId = this.resolveModelId(
        config.modelId,
        config.region ?? 'eu-west-1',
      );

      const messages = config.messages.map((m) => ({
        role: m.role,
        content: [{ text: m.content }],
      }));

      const commandInput: ConverseStreamCommandInput = {
        modelId: resolvedModelId,
        system: [{ text: config.systemPrompt }],
        messages,
        inferenceConfig: {
          temperature: config.temperature ?? 0.7,
          maxTokens: config.maxTokens ?? 2048,
        },
      };

      if (config.guardrailConfig) {
        commandInput.guardrailConfig = {
          guardrailIdentifier: config.guardrailConfig.guardrailIdentifier,
          guardrailVersion: config.guardrailConfig.guardrailVersion,
        };
      }

      const command = new ConverseStreamCommand(commandInput);
      const response = await client.send(command);

      if (response.stream) {
        for await (const event of response.stream) {
          if (event.contentBlockDelta?.delta?.text) {
            yield event.contentBlockDelta.delta.text;
          }
        }
      }
    } catch (error) {
      this.logger.error(`Bedrock stream failed: ${error}`);
      throw new ServiceUnavailableException(
        'AI service is currently unavailable. Please check your AWS Bedrock configuration.',
      );
    }
  }
}
