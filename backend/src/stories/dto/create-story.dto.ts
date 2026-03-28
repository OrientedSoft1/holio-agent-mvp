import { IsString, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StoryPrivacy } from '../../common/enums.js';

export class CreateStoryDto {
  @ApiProperty({ example: 'https://cdn.holio.app/stories/abc.jpg' })
  @IsString()
  mediaUrl: string;

  @ApiProperty({ example: 'image', enum: ['image', 'video'] })
  @IsString()
  mediaType: string;

  @ApiPropertyOptional({ example: 'Check this out!' })
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiPropertyOptional({ enum: StoryPrivacy })
  @IsEnum(StoryPrivacy)
  @IsOptional()
  privacyLevel?: StoryPrivacy;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  allowedUserIds?: string[];
}
