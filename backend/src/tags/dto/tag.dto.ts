import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: '📌' })
  @IsString()
  emoji: string;

  @ApiProperty({ example: 'Important' })
  @IsString()
  name: string;
}

export class UpdateTagDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emoji?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}

export class AddMessageTagDto {
  @ApiProperty()
  @IsUUID()
  tagId: string;
}
