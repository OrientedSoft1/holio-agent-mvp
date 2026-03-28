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

interface StoredCode {
  code: string;
  expiresAt: Date;
  attempts: number;
  lockedUntil?: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly verificationCodes = new Map<string, StoredCode>();

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  sendCode(dto: SendCodeDto) {
    const phoneKey = `${dto.countryCode}${dto.phone}`;
    const existing = this.verificationCodes.get(phoneKey);

    if (existing?.lockedUntil && existing.lockedUntil > new Date()) {
      throw new ForbiddenException(
        'Too many attempts. Please try again in 24 hours.',
      );
    }

    if (existing && existing.attempts >= 5) {
      const lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      this.verificationCodes.set(phoneKey, {
        ...existing,
        lockedUntil,
      });
      throw new ForbiddenException(
        'Too many attempts. Please try again in 24 hours.',
      );
    }

    const code = String(Math.floor(10000 + Math.random() * 90000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    this.verificationCodes.set(phoneKey, {
      code,
      expiresAt,
      attempts: existing ? existing.attempts + 1 : 1,
    });

    this.logger.log(`[DEV] Verification code for ${phoneKey}: ${code}`);

    return { message: 'Code sent' };
  }

  async verifyCode(dto: VerifyCodeDto) {
    const phoneKey = `${dto.countryCode}${dto.phone}`;
    const stored = this.verificationCodes.get(phoneKey);

    if (!stored) {
      throw new BadRequestException(
        'No verification code found. Request a new one.',
      );
    }

    if (stored.lockedUntil && stored.lockedUntil > new Date()) {
      throw new ForbiddenException(
        'Too many attempts. Please try again in 24 hours.',
      );
    }

    if (stored.expiresAt < new Date()) {
      this.verificationCodes.delete(phoneKey);
      throw new BadRequestException(
        'Verification code expired. Request a new one.',
      );
    }

    if (stored.code !== dto.code) {
      stored.attempts += 1;
      if (stored.attempts >= 5) {
        stored.lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
      throw new BadRequestException('Invalid verification code.');
    }

    this.verificationCodes.delete(phoneKey);

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
