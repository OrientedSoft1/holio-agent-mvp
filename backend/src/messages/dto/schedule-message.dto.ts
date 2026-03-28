import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  MaxLength,
  IsUUID,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../../common/enums.js';

export class ScheduleMessageDto {
  @ApiPropertyOptional({ example: 'Hello world!' })
  @IsString()
  @IsOptional()
  @MaxLength(10000)
  content?: string;

  @ApiPropertyOptional({ enum: MessageType, default: MessageType.TEXT })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @ApiPropertyOptional()
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
  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isViewOnce?: boolean;

  @ApiProperty({ description: 'ISO date when message should be sent' })
  @IsDateString()
  scheduledAt: string;
}
