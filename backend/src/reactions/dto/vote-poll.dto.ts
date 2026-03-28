import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VotePollDto {
  @ApiProperty({ example: 0, description: 'Index of the option to vote for' })
  @IsNumber()
  @Min(0)
  optionIndex: number;
}
