import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeDto {
  @ApiProperty({ example: '90012345' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '+47' })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  @Length(5, 5)
  code: string;
}
