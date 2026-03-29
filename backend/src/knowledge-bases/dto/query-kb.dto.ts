import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class QueryKBDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(25)
  maxResults?: number;
}

export class RagQueryDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsString()
  modelId?: string;
}

export class CreateKBDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  s3BucketName: string;
}
