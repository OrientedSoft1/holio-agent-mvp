import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForwardMessageDto {
  @ApiProperty({ description: 'UUID of the message to forward' })
  @IsUUID()
  messageId: string;

  @ApiProperty({ description: 'UUID of the target chat' })
  @IsUUID()
  targetChatId: string;
}
