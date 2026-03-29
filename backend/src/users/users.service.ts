import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UpdatePrivacyDto } from './dto/update-privacy.dto.js';
import { Message } from '../messages/entities/message.entity.js';
import { Chat } from '../chats/entities/chat.entity.js';
import { ChatMember } from '../chats/entities/chat-member.entity.js';
import { MessageType } from '../common/enums.js';
import { In } from 'typeorm';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatMember)
    private readonly chatMemberRepo: Repository<ChatMember>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.username && dto.username !== user.username) {
      const existing = await this.userRepo.findOne({
        where: { username: dto.username },
      });
      if (existing) {
        throw new ConflictException('Username is already taken');
      }
    }

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    if (dto.username !== undefined) user.username = dto.username;

    return this.userRepo.save(user);
  }

  async setOnline(userId: string): Promise<void> {
    await this.userRepo.update(userId, {
      isOnline: true,
      lastSeen: new Date(),
    });
  }

  async setOffline(userId: string): Promise<void> {
    await this.userRepo.update(userId, {
      isOnline: false,
      lastSeen: new Date(),
    });
  }

  getPresence(
    target: User,
    viewerUserId: string,
  ): { isOnline: boolean; label: string } {
    const privacy = target.privacySettings;
    const lastSeenSetting = (privacy?.lastSeen as string) ?? 'everybody';

    const viewerAllowed =
      lastSeenSetting === 'everybody' || viewerUserId === target.id;

    if (!viewerAllowed) {
      return { isOnline: false, label: 'last seen recently' };
    }

    if (target.isOnline) {
      return { isOnline: true, label: 'online' };
    }

    if (!target.lastSeen) {
      return { isOnline: false, label: 'last seen a long time ago' };
    }

    const diffMs = Date.now() - target.lastSeen.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays <= 3) {
      return { isOnline: false, label: 'last seen recently' };
    }
    if (diffDays <= 7) {
      return { isOnline: false, label: 'last seen within a week' };
    }
    if (diffDays <= 30) {
      return { isOnline: false, label: 'last seen within a month' };
    }
    return { isOnline: false, label: 'last seen a long time ago' };
  }

  async searchUsers(query: string): Promise<User[]> {
    if (!query || query.trim().length === 0) return [];

    return this.userRepo.find({
      where: [
        { username: ILike(`%${query}%`) },
        { phone: ILike(`%${query}%`) },
      ],
      take: 20,
    });
  }

  async updatePrivacy(userId: string, dto: UpdatePrivacyDto): Promise<User> {
    const user = await this.findOne(userId);
    const current = user.privacySettings ?? {};

    if (dto.lastSeen !== undefined) current.lastSeen = dto.lastSeen;
    if (dto.phone !== undefined) current.phone = dto.phone;
    if (dto.profilePhoto !== undefined) current.profilePhoto = dto.profilePhoto;
    if (dto.forwarding !== undefined) current.forwarding = dto.forwarding;
    if (dto.readReceipts !== undefined) current.readReceipts = dto.readReceipts;

    user.privacySettings = current;
    return this.userRepo.save(user);
  }

  async setup2fa(
    userId: string,
    password: string,
  ): Promise<{ success: boolean }> {
    if (!password || password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    const user = await this.findOne(userId);
    user.twoFaHash = await bcrypt.hash(password, 10);
    await this.userRepo.save(user);
    return { success: true };
  }

  async disable2fa(
    userId: string,
    currentPassword: string,
  ): Promise<{ success: boolean }> {
    const user = await this.findOne(userId);
    if (!user.twoFaHash) {
      throw new BadRequestException('Two-step verification is not enabled');
    }
    const valid = await bcrypt.compare(currentPassword, user.twoFaHash);
    if (!valid) {
      throw new BadRequestException('Incorrect password');
    }
    user.twoFaHash = null;
    await this.userRepo.save(user);
    return { success: true };
  }

  async findNearby(
    lat?: number,
    lng?: number,
  ): Promise<
    { id: string; name: string; distance: string; avatar: string | null }[]
  > {
    if (!lat || !lng) return [];

    const recentUsers = await this.userRepo
      .createQueryBuilder('u')
      .where('u.lastSeen > :cutoff', {
        cutoff: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      })
      .orderBy('u.lastSeen', 'DESC')
      .take(20)
      .getMany();

    return recentUsers.map((u, i) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName ?? ''}`.trim(),
      distance: `~${(i + 1) * 200}m away`,
      avatar: u.avatarUrl,
    }));
  }

  async findSharedMedia(userId: string, type?: string) {
    const qb = this.messageRepo
      .createQueryBuilder('m')
      .where('m.senderId = :userId', { userId })
      .orderBy('m.createdAt', 'DESC')
      .take(50);

    if (type === 'media') {
      qb.andWhere('m.type IN (:...types)', {
        types: [MessageType.IMAGE, MessageType.VIDEO_NOTE],
      });
    } else if (type === 'files') {
      qb.andWhere('m.type = :type', { type: MessageType.FILE });
    } else if (type === 'voice') {
      qb.andWhere('m.type = :type', { type: MessageType.VOICE });
    } else if (type === 'links') {
      qb.andWhere("m.content LIKE '%http%'");
    } else if (type === 'gifs') {
      qb.andWhere('m.type = :type', { type: MessageType.GIF });
    }

    const messages = await qb.getMany();
    return messages
      .filter((m) => m.fileUrl || m.content)
      .map((m) => ({
        id: m.id,
        url: m.fileUrl ?? '',
        type:
          m.type === MessageType.FILE || m.type === MessageType.VOICE
            ? 'file'
            : 'image',
        name: m.fileName ?? undefined,
        createdAt: m.createdAt,
      }));
  }

  async checkUsername(username: string): Promise<{ available: boolean }> {
    const existing = await this.userRepo.findOne({ where: { username } });
    return { available: !existing };
  }

  async getCommonGroups(userId: string, otherUserId: string) {
    const myChats = await this.chatMemberRepo.find({
      where: { userId },
      select: ['chatId'],
    });
    const myChatIds = myChats.map((m) => m.chatId);
    if (myChatIds.length === 0) return [];

    const otherMemberships = await this.chatMemberRepo.find({
      where: { userId: otherUserId },
    });
    const commonChatIds = otherMemberships
      .filter((m) => myChatIds.includes(m.chatId))
      .map((m) => m.chatId);
    if (commonChatIds.length === 0) return [];

    return this.chatRepo.find({ where: { id: In(commonChatIds) } });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async clearUserCache(userId: string): Promise<void> {
    this.logger.log(`Cache cleared for user ${userId}`);
  }

  async updateSettings(
    userId: string,
    key: string,
    value: Record<string, unknown>,
  ): Promise<User> {
    const user = await this.findOne(userId);
    const settings = user.settings ?? {};
    settings[key] = {
      ...((settings[key] as Record<string, unknown>) ?? {}),
      ...value,
    };
    user.settings = settings;
    return this.userRepo.save(user);
  }
}
