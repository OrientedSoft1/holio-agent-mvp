import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyRole } from '../../common/enums.js';

export class UpdateMemberDto {
  @ApiProperty({ enum: CompanyRole, example: CompanyRole.ADMIN })
  @IsEnum(CompanyRole)
  role: CompanyRole;
}
