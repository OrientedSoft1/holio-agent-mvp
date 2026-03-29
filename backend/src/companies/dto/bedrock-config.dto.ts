import { IsString, IsOptional, IsArray, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({
    example: 'arn:aws:iam::123456789012:role/AmazonBedrockExecutionRoleForKB',
  })
  @IsString()
  @IsOptional()
  kbRoleArn?: string;

  @ApiPropertyOptional({
    example: 'arn:aws:aoss:us-east-1:123456789012:collection/abc123def456',
  })
  @IsString()
  @IsOptional()
  aossCollectionArn?: string;

  @ApiPropertyOptional({
    example: 'my-kb-index',
    description: 'OpenSearch Serverless vector index name',
  })
  @IsString()
  @IsOptional()
  aossIndexName?: string;
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
