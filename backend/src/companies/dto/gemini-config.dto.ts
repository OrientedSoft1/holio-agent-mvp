import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGeminiConfigDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Gemini API key' })
  apiKey?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Default Gemini model ID' })
  defaultModelId?: string;
}

export class ValidateGeminiKeyDto {
  @IsString()
  @ApiProperty({ description: 'Gemini API key to validate' })
  apiKey: string;
}
