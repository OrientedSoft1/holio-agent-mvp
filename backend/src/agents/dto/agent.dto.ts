import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  modelId: string;

  @ApiProperty()
  @IsString()
  instruction: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  actionGroups?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  knowledgeBaseIds?: string[];
}

export class UpdateAgentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modelId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  actionGroups?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  knowledgeBaseIds?: string[];
}
