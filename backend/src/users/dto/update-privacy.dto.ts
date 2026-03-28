import { IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePrivacyDto {
  @ApiPropertyOptional({ enum: ['everybody', 'contacts', 'nobody'] })
  @IsString()
  @IsIn(['everybody', 'contacts', 'nobody'])
  @IsOptional()
  lastSeen?: string;

  @ApiPropertyOptional({ enum: ['everybody', 'contacts', 'nobody'] })
  @IsString()
  @IsIn(['everybody', 'contacts', 'nobody'])
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: ['everybody', 'contacts', 'nobody'] })
  @IsString()
  @IsIn(['everybody', 'contacts', 'nobody'])
  @IsOptional()
  profilePhoto?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  forwarding?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  readReceipts?: boolean;
}
