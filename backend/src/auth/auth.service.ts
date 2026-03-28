import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity.js';
import { SendCodeDto } from './dto/send-code.dto.js';
import { VerifyCodeDto } from './dto/verify-code.dto.js';
import { Verify2faDto } from './dto/verify-2fa.dto.js';
import { SmsService } from './sms.service.js';
import { OtpStoreService } from './otp-store.service.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
    private readonly otpStore: OtpStoreService,
  ) {}

  async sendCode(dto: SendCodeDto) {
    const phoneKey = `${dto.countryCode}${dto.phone}`;
    const existing = await this.otpStore.get(phoneKey);

    if (existing && this.otpStore.isLocked(existing)) {
      throw new ForbiddenException(
        'Too many attempts. Please try again in 24 hours.',
      );
    }

    if (existing && this.otpStore.isMaxAttempts(existing)) {
      await this.otpStore.lock(phoneKey);
      throw new ForbiddenException(
        'Too many attempts. Please try again in 24 hours.',
      );
    }

    const code = String(Math.floor(10000 + Math.random() * 90000));
    await this.otpStore.store(phoneKey, code);
    await this.smsService.sendOtp(phoneKey, code);

    return { message: 'Code sent' };
  }

  async verifyCode(dto: VerifyCodeDto) {
    const phoneKey = `${dto.countryCode}${dto.phone}`;
    const stored = await this.otpStore.get(phoneKey);

    if (!stored) {
      throw new BadRequestException(
        'No verification code found. Request a new one.',
      );
    }

    if (this.otpStore.isLocked(stored)) {
      throw new ForbiddenException(
        'Too many attempts. Please try again in 24 hours.',
      );
    }

    if (this.otpStore.isExpired(stored)) {
      await this.otpStore.delete(phoneKey);
      throw new BadRequestException(
        'Verification code expired. Request a new one.',
      );
    }

    if (stored.code !== dto.code) {
      const attempts = await this.otpStore.incrementAttempts(phoneKey);
      if (attempts >= 5) {
        await this.otpStore.lock(phoneKey);
      }
      throw new BadRequestException('Invalid verification code.');
    }

    await this.otpStore.delete(phoneKey);

    let user = await this.usersRepository.findOne({
      where: { phone: dto.phone, countryCode: dto.countryCode },
    });

    if (!user) {
      user = this.usersRepository.create({
        phone: dto.phone,
        countryCode: dto.countryCode,
      });
      user = await this.usersRepository.save(user);

      const tokens = this.generateTokens(user);
      return { ...tokens, isNewUser: true };
    }

    if (user.twoFaHash) {
      const tempToken = this.jwtService.sign(
        { sub: user.id, type: '2fa' },
        { expiresIn: '5m' },
      );
      return { tempToken, requires2fa: true };
    }

    const tokens = this.generateTokens(user);
    return { ...tokens, isNewUser: false };
  }

  async verify2fa(dto: Verify2faDto) {
    let payload: { sub: string; type: string };
    try {
      payload = this.jwtService.verify(dto.tempToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired temp token.');
    }

    if (payload.type !== '2fa') {
      throw new UnauthorizedException('Invalid token type.');
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.twoFaHash) {
      throw new UnauthorizedException('User not found or 2FA not enabled.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.twoFaHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid 2FA password.');
    }

    return this.generateTokens(user);
  }

  async refreshToken(token: string) {
    let payload: { sub: string; phone: string; type: string };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type.');
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const accessToken = this.jwtService.sign(
      { sub: user.id, phone: user.phone },
      { expiresIn: '15m' },
    );

    return { accessToken };
  }

  private generateTokens(user: User) {
    const tokenPayload = { sub: user.id, phone: user.phone };

    const accessToken = this.jwtService.sign(tokenPayload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(
      { ...tokenPayload, type: 'refresh' },
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }
}
