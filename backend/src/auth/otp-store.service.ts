import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface StoredCode {
  code: string;
  attempts: number;
  lockedUntil?: string;
}

const OTP_TTL_SECONDS = 5 * 60;
const LOCK_TTL_SECONDS = 24 * 60 * 60;
const MAX_ATTEMPTS = 5;

@Injectable()
export class OtpStoreService {
  private readonly logger = new Logger(OtpStoreService.name);
  private readonly redis: Redis;
  private readonly keyPrefix = 'otp:';

  constructor(private readonly config: ConfigService) {
    this.redis = new Redis({
      host: config.get<string>('REDIS_HOST', 'localhost'),
      port: config.get<number>('REDIS_PORT', 6379),
      keyPrefix: this.keyPrefix,
    });

    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });
  }

  async store(phoneKey: string, code: string): Promise<void> {
    const existing = await this.get(phoneKey);
    const attempts = existing ? existing.attempts + 1 : 1;

    const data: StoredCode = { code, attempts };
    await this.redis.set(phoneKey, JSON.stringify(data), 'EX', OTP_TTL_SECONDS);
  }

  async get(phoneKey: string): Promise<StoredCode | null> {
    const raw = await this.redis.get(phoneKey);
    if (!raw) return null;
    return JSON.parse(raw) as StoredCode;
  }

  async delete(phoneKey: string): Promise<void> {
    await this.redis.del(phoneKey);
  }

  async lock(phoneKey: string): Promise<void> {
    const lockedUntil = new Date(Date.now() + LOCK_TTL_SECONDS * 1000).toISOString();
    const data: StoredCode = { code: '', attempts: MAX_ATTEMPTS, lockedUntil };
    await this.redis.set(phoneKey, JSON.stringify(data), 'EX', LOCK_TTL_SECONDS);
  }

  async incrementAttempts(phoneKey: string): Promise<number> {
    const existing = await this.get(phoneKey);
    if (!existing) return 0;

    existing.attempts += 1;
    const ttl = await this.redis.ttl(phoneKey);
    if (ttl > 0) {
      await this.redis.set(phoneKey, JSON.stringify(existing), 'EX', ttl);
    }
    return existing.attempts;
  }

  isLocked(stored: StoredCode): boolean {
    if (!stored.lockedUntil) return false;
    return new Date(stored.lockedUntil) > new Date();
  }

  isExpired(stored: StoredCode): boolean {
    return !stored.code;
  }

  isMaxAttempts(stored: StoredCode): boolean {
    return stored.attempts >= MAX_ATTEMPTS;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
