import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsBoolean,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../../common/enums.js';

export class CreateMessageDto {
  @ApiPropertyOptional({ example: 'Hello world!' })
  @IsString()
  @IsOptional()
  @MaxLength(10000)
  content?: string;

  @ApiPropertyOptional({ enum: MessageType, default: MessageType.TEXT })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @ApiPropertyOptional({ description: 'UUID of message being replied to' })
  @IsUUID()
  @IsOptional()
  replyToId?: string;

  @ApiPropertyOptional()
  @IsString()
  @ValidateIf((o: CreateMessageDto) =>
    [
      MessageType.VOICE,
      MessageType.VIDEO_NOTE,
      MessageType.FILE,
      MessageType.IMAGE,
    ].includes(o.type as MessageType),
  )
  @IsOptional()
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Duration in seconds (voice/videoNote)' })
  @IsNumber()
  @ValidateIf((o: CreateMessageDto) =>
    [MessageType.VOICE, MessageType.VIDEO_NOTE].includes(o.type as MessageType),
  )
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'View-once message (auto-deletes after viewing)',
  })
  @IsBoolean()
  @IsOptional()
  isViewOnce?: boolean;
}
