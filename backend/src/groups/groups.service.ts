import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Chat } from '../chats/entities/chat.entity.js';
import { ChatMember } from '../chats/entities/chat-member.entity.js';
import { Message } from '../messages/entities/message.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CompanyMember } from '../companies/entities/company-member.entity.js';
import { Company } from '../companies/entities/company.entity.js';
import { CreateChannelDto } from './dto/create-channel.dto.js';
import { UpdateChannelDto } from './dto/update-channel.dto.js';
import { ChannelPermissionsDto } from './dto/set-permissions.dto.js';
import { CreateCrossCompanyGroupDto } from './dto/create-cross-company-group.dto.js';
import { ChatType, ChatMemberRole, CompanyRole } from '../common/enums.js';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatMember)
    private readonly chatMemberRepo: Repository<ChatMember>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(CompanyMember)
    private readonly companyMemberRepo: Repository<CompanyMember>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  // ──── Channel CRUD (Issue #30) ────

  async createChannel(userId: string, dto: CreateChannelDto): Promise<Chat> {
    await this.requireCompanyAdmin(dto.companyId, userId);

    const chat = this.chatRepo.create({
      companyId: dto.companyId,
      type: ChatType.COMPANY_CHANNEL,
      name: dto.name,
      description: dto.description ?? null,
      isPublic: dto.isPublic ?? false,
      slowModeInterval: dto.slowModeInterval ?? 0,
    });
    const saved = await this.chatRepo.save(chat);

    await this.chatMemberRepo.save(
      this.chatMemberRepo.create({
        chatId: saved.id,
        userId,
        role: ChatMemberRole.OWNER,
        permissions: {
          sendMessages: true,
          sendMedia: true,
          pinMessages: true,
          addMembers: true,
        },
      }),
    );

    return saved;
  }

  async updateChannel(
    channelId: string,
    userId: string,
    dto: UpdateChannelDto,
  ): Promise<Chat> {
    const chat = await this.findChannelOrFail(channelId);
    await this.requireChannelAdmin(channelId, userId);

    if (dto.name !== undefined) chat.name = dto.name;
    if (dto.description !== undefined) chat.description = dto.description;
    if (dto.isPublic !== undefined) chat.isPublic = dto.isPublic;
    if (dto.slowModeInterval !== undefined)
      chat.slowModeInterval = dto.slowModeInterval;

    return this.chatRepo.save(chat);
  }

  // ──── Permissions ────

  async setPermissions(
    channelId: string,
    targetUserId: string,
    permissions: ChannelPermissionsDto,
    currentUserId: string,
  ): Promise<ChatMember> {
    await this.findChannelOrFail(channelId);
    await this.requireChannelAdmin(channelId, currentUserId);

    const target = await this.chatMemberRepo.findOne({
      where: { chatId: channelId, userId: targetUserId },
    });
    if (!target) {
      throw new NotFoundException('User is not a member of this channel');
    }
    if (target.role === ChatMemberRole.OWNER) {
      throw new ForbiddenException('Cannot change owner permissions');
    }

    target.permissions = {
      ...target.permissions,
      ...permissions,
    };
    return this.chatMemberRepo.save(target);
  }

  // ──── Members ────

  async getChannelMembers(channelId: string, page = 1, limit = 20) {
    await this.findChannelOrFail(channelId);

    const [data, total] = await this.chatMemberRepo.findAndCount({
      where: { chatId: channelId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async kickMember(
    channelId: string,
    targetUserId: string,
    currentUserId: string,
  ): Promise<void> {
    await this.findChannelOrFail(channelId);
    await this.requireChannelAdmin(channelId, currentUserId);

    const target = await this.chatMemberRepo.findOne({
      where: { chatId: channelId, userId: targetUserId },
    });
    if (!target) {
      throw new NotFoundException('User is not a member of this channel');
    }
    if (target.role === ChatMemberRole.OWNER) {
      throw new ForbiddenException('Cannot kick the channel owner');
    }

    await this.chatMemberRepo.remove(target);
  }

  async banMember(
    channelId: string,
    targetUserId: string,
    currentUserId: string,
  ): Promise<Chat> {
    const chat = await this.findChannelOrFail(channelId);
    await this.requireChannelAdmin(channelId, currentUserId);

    const target = await this.chatMemberRepo.findOne({
      where: { chatId: channelId, userId: targetUserId },
    });
    if (target?.role === ChatMemberRole.OWNER) {
      throw new ForbiddenException('Cannot ban the channel owner');
    }

    const metadata = chat.metadata ?? {};
    const bannedList = ((metadata.bannedUserIds as string[]) ?? []).slice();
    if (!bannedList.includes(targetUserId)) {
      bannedList.push(targetUserId);
    }
    metadata.bannedUserIds = bannedList;

    await this.chatRepo
      .createQueryBuilder()
      .update(Chat)
      .set({ metadata } as Record<string, unknown>)
      .where('id = :id', { id: channelId })
      .execute();

    if (target) {
      await this.chatMemberRepo.remove(target);
    }

    return this.chatRepo.findOneOrFail({ where: { id: channelId } });
  }

  // ──── Invite Links ────

  async getInviteLinks(channelId: string, userId: string) {
    await this.findChannelOrFail(channelId);
    await this.requireChannelAdmin(channelId, userId);

    const chat = await this.chatRepo.findOneOrFail({
      where: { id: channelId },
    });
    const metadata = chat.metadata ?? {};
    const inviteLinks =
      (metadata.inviteLinks as Array<Record<string, unknown>>) ?? [];

    return inviteLinks
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt as string).getTime() -
          new Date(a.createdAt as string).getTime(),
      );
  }

  async generateInviteLink(
    channelId: string,
    userId: string,
    expiresInHours = 168,
  ): Promise<{ token: string; expiresAt: Date }> {
    await this.findChannelOrFail(channelId);
    await this.requireChannelAdmin(channelId, userId);

    const token = randomBytes(24).toString('base64url');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const chat = await this.chatRepo.findOneOrFail({
      where: { id: channelId },
    });
    const metadata = chat.metadata ?? {};
    const inviteLinks = (
      (metadata.inviteLinks as Array<Record<string, unknown>>) ?? []
    ).slice();
    inviteLinks.push({
      token,
      createdBy: userId,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    });
    metadata.inviteLinks = inviteLinks;

    await this.chatRepo
      .createQueryBuilder()
      .update(Chat)
      .set({ metadata } as Record<string, unknown>)
      .where('id = :id', { id: channelId })
      .execute();

    return { token, expiresAt };
  }

  async joinViaInviteLink(token: string, userId: string): Promise<Chat> {
    const chats = await this.chatRepo
      .createQueryBuilder('chat')
      .where("chat.metadata->'inviteLinks' @> :token::jsonb", {
        token: JSON.stringify([{ token }]),
      })
      .getMany();

    if (chats.length === 0) {
      throw new NotFoundException('Invalid invite link');
    }

    const chat = chats[0];
    const metadata = chat.metadata ?? {};
    const inviteLinks =
      (metadata.inviteLinks as Array<Record<string, unknown>>) ?? [];
    const link = inviteLinks.find((l) => l.token === token);
    if (!link) {
      throw new NotFoundException('Invalid invite link');
    }
    if (new Date() > new Date(link.expiresAt as string)) {
      throw new BadRequestException('Invite link has expired');
    }

    const bannedList = (metadata.bannedUserIds as string[]) ?? [];
    if (bannedList.includes(userId)) {
      throw new ForbiddenException('You are banned from this channel');
    }

    const existing = await this.chatMemberRepo.findOne({
      where: { chatId: chat.id, userId },
    });
    if (existing) {
      throw new ConflictException('You are already a member of this channel');
    }

    await this.chatMemberRepo.save(
      this.chatMemberRepo.create({
        chatId: chat.id,
        userId,
        role: ChatMemberRole.MEMBER,
        permissions: {
          sendMessages: true,
          sendMedia: true,
          pinMessages: false,
          addMembers: false,
        },
      }),
    );

    return chat;
  }

  // ──── Slow Mode ────

  async enforceSlowMode(chatId: string, userId: string): Promise<void> {
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat || chat.slowModeInterval <= 0) return;

    const member = await this.chatMemberRepo.findOne({
      where: { chatId, userId },
    });
    if (
      member?.role === ChatMemberRole.OWNER ||
      member?.role === ChatMemberRole.ADMIN
    ) {
      return;
    }

    const lastMessage = await this.messageRepo.findOne({
      where: { chatId, senderId: userId },
      order: { createdAt: 'DESC' },
    });

    if (lastMessage) {
      const elapsed = (Date.now() - lastMessage.createdAt.getTime()) / 1000;
      if (elapsed < chat.slowModeInterval) {
        const remaining = Math.ceil(chat.slowModeInterval - elapsed);
        throw new BadRequestException(
          `Slow mode active. Wait ${remaining} seconds before sending again.`,
        );
      }
    }
  }

  // ──── Cross-Company Groups (Issue #32) ────

  async createCrossCompanyGroup(
    userId: string,
    dto: CreateCrossCompanyGroupDto,
  ): Promise<Chat> {
    const creator = await this.userRepo.findOne({ where: { id: userId } });
    if (!creator) {
      throw new NotFoundException('User not found');
    }

    const allUserIds = [
      userId,
      ...dto.memberUserIds.filter((id) => id !== userId),
    ];

    for (const memberId of allUserIds) {
      const companyMemberships = await this.companyMemberRepo.find({
        where: { userId: memberId },
        relations: ['company'],
      });

      if (companyMemberships.length === 0) continue;

      const anyAllows = companyMemberships.some(
        (cm) => cm.company?.settings?.allowCrossCompany === true,
      );
      if (!anyAllows) {
        const user = await this.userRepo.findOne({
          where: { id: memberId },
        });
        throw new ForbiddenException(
          `User ${user?.firstName ?? memberId}'s company does not allow cross-company groups`,
        );
      }
    }

    const chat = this.chatRepo.create({
      companyId: null,
      type: ChatType.CROSS_COMPANY,
      name: dto.name,
      description: dto.description ?? null,
    });
    const saved = await this.chatRepo.save(chat);

    const members = allUserIds.map((uid, index) =>
      this.chatMemberRepo.create({
        chatId: saved.id,
        userId: uid,
        role: index === 0 ? ChatMemberRole.OWNER : ChatMemberRole.MEMBER,
      }),
    );
    await this.chatMemberRepo.save(members);

    return saved;
  }

  // ──── Helpers ────

  private async findChannelOrFail(channelId: string): Promise<Chat> {
    const chat = await this.chatRepo.findOne({ where: { id: channelId } });
    if (!chat) {
      throw new NotFoundException('Channel not found');
    }
    return chat;
  }

  private async requireChannelAdmin(
    channelId: string,
    userId: string,
  ): Promise<ChatMember> {
    const member = await this.chatMemberRepo.findOne({
      where: { chatId: channelId, userId },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this channel');
    }
    if (
      member.role !== ChatMemberRole.OWNER &&
      member.role !== ChatMemberRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only admins and owners can perform this action',
      );
    }
    return member;
  }

  private async requireCompanyAdmin(
    companyId: string,
    userId: string,
  ): Promise<CompanyMember> {
    const member = await this.companyMemberRepo.findOne({
      where: { companyId, userId },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this company');
    }
    if (
      member.role !== CompanyRole.OWNER &&
      member.role !== CompanyRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only company admins and owners can create channels',
      );
    }
    return member;
  }
}
