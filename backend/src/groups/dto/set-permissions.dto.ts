import { IsUUID, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChannelPermissionsDto {
  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  sendMessages?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  sendMedia?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  pinMessages?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  addMembers?: boolean;
}

export class SetPermissionsDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ type: ChannelPermissionsDto })
  @ValidateNested()
  @Type(() => ChannelPermissionsDto)
  permissions: ChannelPermissionsDto;
}
