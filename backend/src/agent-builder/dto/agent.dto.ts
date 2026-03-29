import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  modelId: string;

  @IsString()
  instruction: string;

  @IsOptional()
  @IsArray()
  actionGroups?: {
    name: string;
    description: string;
    lambdaArn?: string;
    apiSchema?: string;
  }[];

  @IsOptional()
  @IsArray()
  knowledgeBaseIds?: string[];
}

export class UpdateAgentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  modelId?: string;

  @IsOptional()
  @IsString()
  instruction?: string;

  @IsOptional()
  @IsArray()
  actionGroups?: {
    name: string;
    description: string;
    lambdaArn?: string;
    apiSchema?: string;
  }[];

  @IsOptional()
  @IsArray()
  knowledgeBaseIds?: string[];
}

export class InvokeAgentDto {
  @IsString()
  input: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
