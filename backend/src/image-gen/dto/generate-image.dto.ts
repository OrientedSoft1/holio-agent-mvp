import { IsString, IsOptional, IsNumber, Min, Max, IsIn } from 'class-validator';

export class GenerateImageDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  negativePrompt?: string;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(15)
  cfgScale?: number;

  @IsOptional()
  @IsNumber()
  seed?: number;

  @IsOptional()
  @IsString()
  @IsIn(['bedrock', 'gemini'])
  provider?: 'bedrock' | 'gemini';
}

export class BackgroundRemoveDto {
  @IsString()
  image: string;
}
