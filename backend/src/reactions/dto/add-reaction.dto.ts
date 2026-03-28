import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddReactionDto {
  @ApiProperty({ example: '👍', description: 'Emoji character' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  emoji: string;
}
