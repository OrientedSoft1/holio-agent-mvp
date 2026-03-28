import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly snsClient: SNSClient | null;
  private readonly smsEnabled: boolean;

  constructor(private readonly config: ConfigService) {
    this.smsEnabled = config.get<string>('SMS_ENABLED', 'false') === 'true';

    if (this.smsEnabled) {
      this.snsClient = new SNSClient({
        region: config.get<string>('AWS_SNS_REGION', 'eu-west-1'),
        credentials: {
          accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID', ''),
          secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY', ''),
        },
      });
      this.logger.log('SMS delivery via AWS SNS enabled');
    } else {
      this.snsClient = null;
      this.logger.warn(
        'SMS delivery disabled — codes will be logged to console. Set SMS_ENABLED=true to enable.',
      );
    }
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    const message = `Your Holio verification code is: ${code}`;

    if (!this.smsEnabled || !this.snsClient) {
      this.logger.log(`[DEV SMS] To ${phone}: ${message}`);
      return;
    }

    try {
      const result = await this.snsClient.send(
        new PublishCommand({
          PhoneNumber: phone,
          Message: message,
          MessageAttributes: {
            'AWS.SNS.SMS.SMSType': {
              DataType: 'String',
              StringValue: 'Transactional',
            },
            'AWS.SNS.SMS.SenderID': {
              DataType: 'String',
              StringValue: this.config.get<string>('SMS_SENDER_ID', 'Holio'),
            },
          },
        }),
      );
      this.logger.log(`SMS sent to ${phone}, MessageId: ${result.MessageId}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phone}`, error);
      throw error;
    }
  }
}
