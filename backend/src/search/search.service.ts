import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { Chat } from '../chats/entities/chat.entity.js';
import { ChatMember } from '../chats/entities/chat-member.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Message } from '../messages/entities/message.entity.js';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatMember)
    private readonly chatMemberRepo: Repository<ChatMember>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async globalSearch(query: string, userId: string) {
    if (!query || query.trim().length === 0) {
      return { chats: [], users: [], messages: [] };
    }
    const q = query.trim();

    const memberRows = await this.chatMemberRepo.find({
      where: { userId },
      select: ['chatId'],
    });
    const chatIds = memberRows.map((m) => m.chatId);

    let chats: Chat[] = [];
    if (chatIds.length > 0) {
      chats = await this.chatRepo
        .createQueryBuilder('chat')
        .where('chat.id IN (:...chatIds)', { chatIds })
        .andWhere('chat.name ILIKE :q', { q: `%${q}%` })
        .orderBy('chat."lastMessageAt"', 'DESC', 'NULLS LAST')
        .take(10)
        .getMany();
    }

    const users = await this.userRepo.find({
      where: [
        { username: ILike(`%${q}%`) },
        { firstName: ILike(`%${q}%`) },
        { lastName: ILike(`%${q}%`) },
        { phone: ILike(`%${q}%`) },
      ],
      take: 10,
    });

    let messages: Message[] = [];
    if (chatIds.length > 0) {
      messages = await this.messageRepo
        .createQueryBuilder('msg')
        .leftJoinAndSelect('msg.sender', 'sender')
        .where('msg."chatId" IN (:...chatIds)', { chatIds })
        .andWhere('msg.content ILIKE :q', { q: `%${q}%` })
        .orderBy('msg."createdAt"', 'DESC')
        .take(20)
        .getMany();
    }

    return { chats, users, messages };
  }

  async searchMessages(
    chatId: string,
    query: string,
    userId: string,
    filters?: { mediaType?: string; dateFrom?: string; dateTo?: string },
  ) {
    if (!query || query.trim().length === 0) {
      return { data: [], total: 0 };
    }

    const membership = await this.chatMemberRepo.findOne({
      where: { chatId, userId },
    });
    if (!membership) {
      return { data: [], total: 0 };
    }

    const qb = this.messageRepo
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.sender', 'sender')
      .where('msg."chatId" = :chatId', { chatId })
      .andWhere('msg.content ILIKE :q', { q: `%${query.trim()}%` });

    if (filters?.mediaType) {
      qb.andWhere('msg.type = :type', { type: filters.mediaType });
    }
    if (filters?.dateFrom) {
      qb.andWhere('msg."createdAt" >= :dateFrom', {
        dateFrom: new Date(filters.dateFrom),
      });
    }
    if (filters?.dateTo) {
      qb.andWhere('msg."createdAt" <= :dateTo', {
        dateTo: new Date(filters.dateTo),
      });
    }

    const [data, total] = await qb
      .orderBy('msg."createdAt"', 'DESC')
      .take(50)
      .getManyAndCount();

    return { data, total };
  }
}
