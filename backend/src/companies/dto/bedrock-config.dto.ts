import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateBedrockConfigDto {
  @ApiPropertyOptional({ example: 'AKIA...' })
  @IsString()
  @IsOptional()
  accessKeyId?: string;

  @ApiPropertyOptional({ example: '********' })
  @IsString()
  @IsOptional()
  secretAccessKey?: string;

  @ApiPropertyOptional({ example: 'eu-west-1' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({
    example: ['anthropic.claude-sonnet', 'amazon.nova-pro'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedModels?: string[];

  @ApiPropertyOptional({ example: 'abc123' })
  @IsString()
  @IsOptional()
  guardrailId?: string;

  @ApiPropertyOptional({ example: 'DRAFT' })
  @IsString()
  @IsOptional()
  guardrailVersion?: string;

  @ApiPropertyOptional({ example: 'anthropic.claude-sonnet' })
  @IsString()
  @IsOptional()
  defaultModelId?: string;

  @ApiPropertyOptional({ example: 500000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxTokensBudget?: number;
}

export class ValidateBedrockCredentialsDto {
  @ApiProperty({ example: 'AKIA...' })
  @IsString()
  accessKeyId: string;

  @ApiProperty({ example: 'wJalrX...' })
  @IsString()
  secretAccessKey: string;

  @ApiPropertyOptional({ example: 'eu-west-1' })
  @IsString()
  @IsOptional()
  region?: string;
}
