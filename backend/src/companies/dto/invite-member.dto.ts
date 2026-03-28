import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InvitationRole } from '../../common/enums.js';

export class InviteMemberDto {
  @ApiPropertyOptional({ example: '+4790012345' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  @ValidateIf((o: InviteMemberDto) => !o.phone)
  email?: string;

  @ApiPropertyOptional({ enum: InvitationRole, default: InvitationRole.MEMBER })
  @IsEnum(InvitationRole)
  @IsOptional()
  role?: InvitationRole = InvitationRole.MEMBER;
}
