import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Verify2faDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
