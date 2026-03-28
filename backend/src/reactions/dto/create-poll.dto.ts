import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PollOptionDto {
  @ApiProperty({ example: 'Option A' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  index: number;
}

export class CreatePollDto {
  @ApiProperty({ example: 'What do you prefer?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ type: [PollOptionDto] })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => PollOptionDto)
  options: PollOptionDto[];

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isQuiz?: boolean;

  @ApiPropertyOptional({ description: 'Index of correct option (quiz mode)' })
  @IsNumber()
  @IsOptional()
  correctOptionIndex?: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  allowMultiple?: boolean;

  @ApiPropertyOptional({ description: 'ISO date when poll auto-closes' })
  @IsDateString()
  @IsOptional()
  closesAt?: string;

  @ApiProperty({ description: 'Chat ID where the poll message is created' })
  @IsString()
  @IsNotEmpty()
  chatId: string;
}
