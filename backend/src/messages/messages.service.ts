import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity.js';
import { ReadReceipt } from './entities/read-receipt.entity.js';
import { Chat } from '../chats/entities/chat.entity.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { MessageType, SenderType } from '../common/enums.js';

const EDIT_WINDOW_MS = 48 * 60 * 60 * 1000;

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(ReadReceipt)
    private readonly receiptRepo: Repository<ReadReceipt>,
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
  ) {}

  async create(
    chatId: string,
    senderId: string,
    dto: CreateMessageDto,
  ): Promise<Message> {
    const message = this.messageRepo.create({
      chatId,
      senderId,
      senderType: SenderType.USER,
      type: dto.type ?? MessageType.TEXT,
      content: dto.content ?? null,
      replyToId: dto.replyToId ?? null,
      fileUrl: dto.fileUrl ?? null,
      fileName: dto.fileName ?? null,
      fileSize: dto.fileSize ?? null,
      mimeType: dto.mimeType ?? null,
      duration: dto.duration ?? null,
      thumbnailUrl: dto.thumbnailUrl ?? null,
    });

    const saved = await this.messageRepo.save(message);

    await this.chatRepo.update(chatId, { lastMessageAt: new Date() });

    return this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['sender', 'replyTo'],
    }) as Promise<Message>;
  }

  async findByChatId(chatId: string, page = 1, limit = 50) {
    const [data, total] = await this.messageRepo.findAndCount({
      where: { chatId },
      relations: ['sender', 'replyTo'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async update(
    messageId: string,
    userId: string,
    content: string,
  ): Promise<Message> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    const age = Date.now() - message.createdAt.getTime();
    if (age > EDIT_WINDOW_MS) {
      throw new BadRequestException(
        'Messages can only be edited within 48 hours',
      );
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();

    return this.messageRepo.save(message);
  }

  async remove(messageId: string, userId: string): Promise<{ chatId: string }> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    const { chatId } = message;
    await this.messageRepo.remove(message);
    return { chatId };
  }

  async markAsRead(messageId: string, userId: string): Promise<ReadReceipt> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const existing = await this.receiptRepo.findOne({
      where: { messageId, userId },
    });
    if (existing) return existing;

    const receipt = this.receiptRepo.create({ messageId, userId });
    return this.receiptRepo.save(receipt);
  }

  async getUnreadCount(chatId: string, userId: string): Promise<number> {
    const lastReceipt = await this.receiptRepo
      .createQueryBuilder('rr')
      .innerJoin('rr.message', 'msg', 'msg."chatId" = :chatId', { chatId })
      .where('rr."userId" = :userId', { userId })
      .orderBy('rr."readAt"', 'DESC')
      .getOne();

    const qb = this.messageRepo
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
}
