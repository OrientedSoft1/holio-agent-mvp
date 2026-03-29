import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Session } from './entities/session.entity.js';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  async findAll(userId: string): Promise<Session[]> {
    return this.sessionRepo.find({
      where: { userId },
      order: { lastActiveAt: 'DESC' },
    });
  }

  async terminate(userId: string, sessionId: string): Promise<void> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    await this.sessionRepo.remove(session);
  }

  async terminateAll(userId: string, exceptSessionId?: string): Promise<void> {
    const where: Record<string, unknown> = { userId };
    if (exceptSessionId) {
      where.id = Not(exceptSessionId);
    }
    await this.sessionRepo.delete(where);
  }

  async createOrUpdate(
    userId: string,
    data: Partial<
      Pick<
        Session,
        | 'deviceName'
        | 'deviceType'
        | 'appVersion'
        | 'ipAddress'
        | 'location'
        | 'isCurrent'
      >
    >,
  ): Promise<Session> {
    const existing = await this.sessionRepo.findOne({
      where: { userId, deviceName: data.deviceName },
    });

    if (existing) {
      existing.lastActiveAt = new Date();
      if (data.ipAddress !== undefined) existing.ipAddress = data.ipAddress;
      if (data.location !== undefined) existing.location = data.location;
      if (data.appVersion !== undefined) existing.appVersion = data.appVersion;
      if (data.isCurrent !== undefined) existing.isCurrent = data.isCurrent;
      return this.sessionRepo.save(existing);
    }

    const session = this.sessionRepo.create({
      userId,
      deviceName: data.deviceName,
      deviceType: data.deviceType ?? 'desktop',
      appVersion: data.appVersion ?? null,
      ipAddress: data.ipAddress ?? null,
      location: data.location ?? null,
      isCurrent: data.isCurrent ?? false,
    });

    return this.sessionRepo.save(session);
  }
}
