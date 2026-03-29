import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  deviceName: string;

  @ApiProperty()
  deviceType: string;

  @ApiProperty({ nullable: true })
  appVersion: string | null;

  @ApiProperty({ nullable: true })
  location: string | null;

  @ApiProperty()
  lastActiveAt: Date;

  @ApiProperty()
  isCurrent: boolean;
}
