import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UpdatePrivacyDto } from './dto/update-privacy.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
}
