import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiPropertyOptional({ description: 'Upload purpose, e.g. "avatar", "chat", "story"' })
  @IsOptional()
  @IsString()
  purpose?: string;
}
