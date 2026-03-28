import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  MaxLength,
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
  @IsOptional()
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}
