import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOpenAIConfigDto {
  @ApiPropertyOptional({ example: 'sk-...' })
  @IsString()
  @IsOptional()
  apiKey?: string;

  @ApiPropertyOptional({ example: 'org-...' })
  @IsString()
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional({ example: 'gpt-4.1' })
  @IsString()
  @IsOptional()
  defaultModelId?: string;
}

export class ValidateOpenAIKeyDto {
  @ApiProperty({ example: 'sk-...' })
  @IsString()
  apiKey: string;
}
