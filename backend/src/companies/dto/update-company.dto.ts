import {
  IsString,
  IsOptional,
  IsUrl,
  IsObject,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UpdateBedrockConfigDto } from './bedrock-config.dto.js';

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: 'Acme Corp Updated' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: { allowBots: true, maxMembers: 200 } })
  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'eu-west-1' })
  @IsString()
  @IsOptional()
  bedrockRegion?: string;

  @ApiPropertyOptional({ type: UpdateBedrockConfigDto })
  @ValidateNested()
  @Type(() => UpdateBedrockConfigDto)
  @IsOptional()
  bedrockConfig?: UpdateBedrockConfigDto;
}
