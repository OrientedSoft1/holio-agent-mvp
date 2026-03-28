import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { SendCodeDto } from './dto/send-code.dto.js';
import { VerifyCodeDto } from './dto/verify-code.dto.js';
import { Verify2faDto } from './dto/verify-2fa.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { Public } from '../common/decorators/public.decorator.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('send-code')
  @ApiOperation({ summary: 'Send verification code to phone number' })
  async sendCode(@Body() dto: SendCodeDto) {
    return this.authService.sendCode(dto);
  }

  @Public()
  @Post('verify-code')
  @ApiOperation({ summary: 'Verify phone verification code' })
  verifyCode(@Body() dto: VerifyCodeDto) {
    return this.authService.verifyCode(dto);
  }

  @Public()
  @Post('verify-2fa')
  @ApiOperation({ summary: 'Verify 2FA password' })
  verify2fa(@Body() dto: Verify2faDto) {
    return this.authService.verify2fa(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Public()
  @Get('countries')
  @ApiOperation({ summary: 'Get list of supported country codes' })
  getCountries() {
    return [
      { code: '+1', name: 'United States' },
      { code: '+1', name: 'Canada' },
      { code: '+44', name: 'United Kingdom' },
      { code: '+47', name: 'Norway' },
      { code: '+46', name: 'Sweden' },
      { code: '+45', name: 'Denmark' },
      { code: '+358', name: 'Finland' },
      { code: '+354', name: 'Iceland' },
      { code: '+49', name: 'Germany' },
      { code: '+33', name: 'France' },
      { code: '+34', name: 'Spain' },
      { code: '+39', name: 'Italy' },
      { code: '+31', name: 'Netherlands' },
      { code: '+32', name: 'Belgium' },
      { code: '+41', name: 'Switzerland' },
      { code: '+43', name: 'Austria' },
      { code: '+48', name: 'Poland' },
      { code: '+351', name: 'Portugal' },
      { code: '+353', name: 'Ireland' },
      { code: '+81', name: 'Japan' },
      { code: '+82', name: 'South Korea' },
      { code: '+86', name: 'China' },
      { code: '+91', name: 'India' },
      { code: '+61', name: 'Australia' },
      { code: '+64', name: 'New Zealand' },
      { code: '+55', name: 'Brazil' },
      { code: '+52', name: 'Mexico' },
      { code: '+7', name: 'Russia' },
      { code: '+90', name: 'Turkey' },
      { code: '+966', name: 'Saudi Arabia' },
      { code: '+971', name: 'United Arab Emirates' },
      { code: '+972', name: 'Israel' },
      { code: '+27', name: 'South Africa' },
      { code: '+234', name: 'Nigeria' },
      { code: '+254', name: 'Kenya' },
      { code: '+65', name: 'Singapore' },
      { code: '+60', name: 'Malaysia' },
      { code: '+66', name: 'Thailand' },
      { code: '+62', name: 'Indonesia' },
      { code: '+63', name: 'Philippines' },
    ];
  }
}
