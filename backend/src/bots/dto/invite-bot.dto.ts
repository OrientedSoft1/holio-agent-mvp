import { IsUUID } from 'class-validator';

export class InviteBotDto {
  @IsUUID()
  botId: string;

  @IsUUID()
  chatId: string;
}
