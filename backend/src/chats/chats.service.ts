import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity.js';
import { ChatMember } from './entities/chat-member.entity.js';
import { CompanyMember } from '../companies/entities/company-member.entity.js';
import { CreateChannelDto } from './dto/create-channel.dto.js';
import { ChatType, ChatMemberRole, CompanyRole } from '../common/enums.js';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatMember)
    private readonly chatMemberRepo: Repository<ChatMember>,
    @InjectRepository(CompanyMember)
    private readonly companyMemberRepo: Repository<CompanyMember>,
  ) {}

  // ──── DM ────

  async createDM(userId: string, targetUserId: string): Promise<Chat> {
    if (userId === targetUserId) {
      throw new ConflictException('Cannot create a DM with yourself');
    }

    const existing = await this.findExistingDM(userId, targetUserId);
    if (existing) return existing;

    const chat = this.chatRepo.create({ type: ChatType.DM });
    const saved = await this.chatRepo.save(chat);

    await this.chatMemberRepo.save([
      this.chatMemberRepo.create({
        chatId: saved.id,
        userId,
        role: ChatMemberRole.MEMBER,
      }),
      this.chatMemberRepo.create({
        chatId: saved.id,
        userId: targetUserId,
        role: ChatMemberRole.MEMBER,
      }),
    ]);

    return saved;
  }

  private async findExistingDM(
    userId: string,
    targetUserId: string,
  ): Promise<Chat | null> {
    const result = await this.chatMemberRepo
      .createQueryBuilder('cm1')
      .innerJoin(
        ChatMember,
        'cm2',
        'cm1."chatId" = cm2."chatId" AND cm2."userId" = :targetUserId',
        { targetUserId },
      )
      .innerJoinAndSelect('cm1.chat', 'chat', 'chat.type = :type', {
        type: ChatType.DM,
      })
      .where('cm1."userId" = :userId', { userId })
      .getOne();

    return result?.chat ?? null;
  }

  // ──── Channel ────

  async createChannel(userId: string, dto: CreateChannelDto): Promise<Chat> {
    const companyMember = await this.companyMemberRepo.findOne({
      where: { companyId: dto.companyId, userId },
    });
    if (!companyMember) {
      throw new ForbiddenException('You are not a member of this company');
    }
    if (
      companyMember.role !== CompanyRole.OWNER &&
      companyMember.role !== CompanyRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only admins and owners can create channels',
      );
    }

    const chat = this.chatRepo.create({
      companyId: dto.companyId,
      type: ChatType.COMPANY_CHANNEL,
      name: dto.name,
      description: dto.description ?? null,
      isPublic: dto.isPublic ?? false,
    });
    const saved = await this.chatRepo.save(chat);

    await this.chatMemberRepo.save(
      this.chatMemberRepo.create({
        chatId: saved.id,
        userId,
        role: ChatMemberRole.OWNER,
      }),
    );

    return saved;
  }

  // ──── Listing ────

  async findAllForUser(userId: string, companyId?: string) {
    const qb = this.chatMemberRepo
      .createQueryBuilder('cm')
      .innerJoinAndSelect('cm.chat', 'chat')
      .where('cm."userId" = :userId', { userId });

    if (companyId) {
      qb.andWhere('chat."companyId" = :companyId', { companyId });
    }

    qb.orderBy('chat."lastMessageAt"', 'DESC', 'NULLS LAST');
    const memberships = await qb.getMany();

    const results = await Promise.all(
      memberships.map(async (m) => {
        const chat = m.chat;

        const lastMessage = await this.getLastMessage(chat.id);
        const unreadCount = await this.getUnreadCount(chat.id, userId);

        let otherMember: unknown = null;
        if (chat.type === ChatType.DM) {
          const otherActual = await this.chatMemberRepo
            .createQueryBuilder('cm')
            .innerJoinAndSelect('cm.user', 'user')
            .where('cm."chatId" = :chatId', { chatId: chat.id })
            .andWhere('cm."userId" != :userId', { userId })
            .getOne();
          otherMember = otherActual?.user ?? null;
        }

        return {
          ...chat,
          lastMessage,
          unreadCount,
          otherMember,
          myRole: m.role,
        };
      }),
    );

    return results;
  }

  private async getLastMessage(chatId: string) {
    const { Message } = await import('../messages/entities/message.entity.js');
    const msgRepo = this.chatRepo.manager.getRepository(Message);
    return msgRepo.findOne({
      where: { chatId },
      order: { createdAt: 'DESC' },
      relations: ['sender'],
    });
  }

  private async getUnreadCount(
    chatId: string,
    userId: string,
  ): Promise<number> {
    const { Message } = await import('../messages/entities/message.entity.js');
    const { ReadReceipt } =
      await import('../messages/entities/read-receipt.entity.js');
    const msgRepo = this.chatRepo.manager.getRepository(Message);
    const receiptRepo = this.chatRepo.manager.getRepository(ReadReceipt);

    const lastReceipt = await receiptRepo
      .createQueryBuilder('rr')
      .innerJoin('rr.message', 'msg', 'msg."chatId" = :chatId', { chatId })
      .where('rr."userId" = :userId', { userId })
      .orderBy('rr."readAt"', 'DESC')
      .getOne();

    const qb = msgRepo
      .createQueryBuilder('msg')
      .where('msg."chatId" = :chatId', { chatId })
      .andWhere('msg."senderId" != :userId', { userId });

    if (lastReceipt) {
      qb.andWhere('msg."createdAt" > :readAt', {
        readAt: lastReceipt.readAt,
      });
    }

    return qb.getCount();
  }

  // ──── Single chat ────

  async findOne(chatId: string, userId: string) {
    const membership = await this.chatMemberRepo.findOne({
      where: { chatId, userId },
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of this chat');
    }

    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['company'],
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const members = await this.chatMemberRepo.find({
      where: { chatId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });

    return { ...chat, members };
  }

  // ──── Member management ────

  async addMember(
    chatId: string,
    userId: string,
    addedByUserId: string,
  ): Promise<ChatMember> {
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    if (chat.type === ChatType.DM) {
      throw new ForbiddenException('Cannot add members to a DM');
    }

    await this.checkChatAdminAccess(chatId, addedByUserId);

    const existing = await this.chatMemberRepo.findOne({
      where: { chatId, userId },
    });
    if (existing) {
      throw new ConflictException('User is already a member of this chat');
    }

    const member = this.chatMemberRepo.create({
      chatId,
      userId,
      role: ChatMemberRole.MEMBER,
    });
    return this.chatMemberRepo.save(member);
  }

  async removeMember(
    chatId: string,
    userId: string,
    removedByUserId: string,
  ): Promise<void> {
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    if (chat.type === ChatType.DM) {
      throw new ForbiddenException('Cannot remove members from a DM');
    }

    if (userId !== removedByUserId) {
      await this.checkChatAdminAccess(chatId, removedByUserId);
    }

    const member = await this.chatMemberRepo.findOne({
      where: { chatId, userId },
    });
    if (!member) {
      throw new NotFoundException('Member not found in this chat');
    }
    if (member.role === ChatMemberRole.OWNER && userId !== removedByUserId) {
      throw new ForbiddenException('Cannot remove the chat owner');
    }

    await this.chatMemberRepo.remove(member);
  }

  // ──── Helpers ────

  async checkMembership(chatId: string, userId: string): Promise<ChatMember> {
    const member = await this.chatMemberRepo.findOne({
      where: { chatId, userId },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this chat');
    }
    return member;
  }

  async getChatMemberIds(chatId: string): Promise<string[]> {
    const members = await this.chatMemberRepo.find({
      where: { chatId },
      select: ['userId'],
    });
    return members.map((m) => m.userId);
  }

  async getMembers(chatId: string) {
    return this.chatMemberRepo.find({
      where: { chatId },
      relations: ['user'],
    });
  }

  async setArchived(chatId: string, userId: string, archived: boolean) {
    const member = await this.chatMemberRepo.findOne({
      where: { chatId, userId },
    });
    if (!member) throw new NotFoundException('Chat membership not found');
    member.permissions = { ...member.permissions, archived };
    return this.chatMemberRepo.save(member);
  }

  async acceptSecretChat(chatId: string, userId: string): Promise<Chat> {
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.type !== ChatType.DM) {
      throw new BadRequestException('Not a secret chat');
    }

    const member = await this.chatMemberRepo.findOne({
      where: { chatId, userId },
    });
    if (!member) throw new ForbiddenException('Not a member of this chat');

    return chat;
  }

  private async checkChatAdminAccess(
    chatId: string,
    userId: string,
  ): Promise<ChatMember> {
    const member = await this.checkMembership(chatId, userId);
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
}
