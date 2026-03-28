import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({ description: 'UUID of the user to add' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
