import { IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CallDirection, CallType } from '../entities/call.entity.js';

export class CreateCallDto {
  @ApiProperty({ description: 'UUID of the call receiver' })
  @IsUUID()
  receiverId: string;

  @ApiPropertyOptional({ description: 'UUID of the associated chat' })
  @IsOptional()
  @IsUUID()
  chatId?: string;

  @ApiProperty({ enum: CallType, description: 'Type of call' })
  @IsEnum(CallType)
  callType: CallType;

  @ApiProperty({ enum: CallDirection, description: 'Direction of the call' })
  @IsEnum(CallDirection)
  direction: CallDirection;
}

export class CallResponseDto {
  @ApiProperty({ description: 'Call UUID' })
  id: string;

  @ApiProperty({ description: 'Caller user UUID' })
  callerId: string;

  @ApiProperty({ description: 'Receiver user UUID' })
  receiverId: string;

  @ApiPropertyOptional({ description: 'Associated chat UUID' })
  chatId: string | null;

  @ApiProperty({ enum: CallDirection })
  direction: CallDirection;

  @ApiProperty({ enum: CallType })
  callType: CallType;

  @ApiPropertyOptional({ description: 'Call start timestamp' })
  startedAt: Date | null;

  @ApiPropertyOptional({ description: 'Call end timestamp' })
  endedAt: Date | null;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  duration: number | null;

  @ApiProperty({ description: 'Record creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Record update timestamp' })
  updatedAt: Date;
}
