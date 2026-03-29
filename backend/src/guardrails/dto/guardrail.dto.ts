import { IsString, IsOptional } from 'class-validator';

export class CreateGuardrailDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  blockedInputMessaging?: string;

  @IsOptional()
  @IsString()
  blockedOutputsMessaging?: string;

  @IsOptional()
  contentFilters?: {
    type: string;
    inputStrength: string;
    outputStrength: string;
  }[];

  @IsOptional()
  deniedTopics?: { name: string; definition: string }[];

  @IsOptional()
  wordFilters?: string[];

  @IsOptional()
  sensitiveInfoTypes?: { type: string; action: string }[];
}

export class TestGuardrailDto {
  @IsString()
  content: string;

  @IsString()
  source: 'INPUT' | 'OUTPUT';
}
