import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSettings } from './entities/notification-settings.entity.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationSettings)
    private readonly settingsRepo: Repository<NotificationSettings>,
  ) {}

  async muteChat(
    userId: string,
    chatId: string,
    duration?: string,
  ): Promise<NotificationSettings> {
    let settings = await this.settingsRepo.findOne({
      where: { userId, chatId },
    });

    if (!settings) {
      settings = this.settingsRepo.create({ userId, chatId });
    }

    settings.muted = true;

    if (duration && duration !== 'forever') {
      const durationMap: Record<string, number> = {
        '1h': 60 * 60 * 1000,
        '8h': 8 * 60 * 60 * 1000,
        '2d': 2 * 24 * 60 * 60 * 1000,
      };
      const ms = durationMap[duration];
      settings.mutedUntil = ms ? new Date(Date.now() + ms) : null;
    } else {
      settings.mutedUntil = null;
    }

    return this.settingsRepo.save(settings);
  }

  async unmuteChat(
    userId: string,
    chatId: string,
  ): Promise<NotificationSettings> {
    let settings = await this.settingsRepo.findOne({
      where: { userId, chatId },
    });

    if (!settings) {
      settings = this.settingsRepo.create({ userId, chatId });
    }

    settings.muted = false;
    settings.mutedUntil = null;
    return this.settingsRepo.save(settings);
  }

  async getSettings(
    userId: string,
    chatId: string,
  ): Promise<NotificationSettings> {
    const settings = await this.settingsRepo.findOne({
      where: { userId, chatId },
    });
    if (!settings) {
      return {
        id: '',
        userId,
        chatId,
        muted: false,
        mutedUntil: null,
        customSound: null,
      } as NotificationSettings;
    }

    if (
      settings.muted &&
      settings.mutedUntil &&
      settings.mutedUntil < new Date()
    ) {
      settings.muted = false;
      settings.mutedUntil = null;
      return this.settingsRepo.save(settings);
    }

    return settings;
  }

  async setCustomSound(
    userId: string,
    chatId: string,
    sound: string,
  ): Promise<NotificationSettings> {
    let settings = await this.settingsRepo.findOne({
      where: { userId, chatId },
    });
    if (!settings) {
      settings = this.settingsRepo.create({ userId, chatId });
    }
    settings.customSound = sound;
    return this.settingsRepo.save(settings);
  }
}
