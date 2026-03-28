import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendCodeDto {
  @ApiProperty({ example: '90012345' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '+47' })
  @IsString()
  @IsNotEmpty()
  countryCode: string;
}
