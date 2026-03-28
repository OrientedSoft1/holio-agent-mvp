import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInviteLinkDto {
  @ApiPropertyOptional({
    description: 'Link expiry in hours (default 168 = 7 days)',
    default: 168,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(8760)
  expiresInHours?: number;
}
