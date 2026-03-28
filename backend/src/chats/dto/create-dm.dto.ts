import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDmDto {
  @ApiProperty({ description: 'UUID of the user to start a DM with' })
  @IsUUID()
  @IsNotEmpty()
  targetUserId: string;
}
