import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity.js';
import { ReadReceipt } from './entities/read-receipt.entity.js';
import { Chat } from '../chats/entities/chat.entity.js';
import { ChatMember } from '../chats/entities/chat-member.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { LinkPreviewService } from './link-preview.service.js';
import { MessageType, SenderType, ChatMemberRole } from '../common/enums.js';

const EDIT_WINDOW_MS = 48 * 60 * 60 * 1000;

const URL_REGEX = /https?:\/\/[^\s<>]+/gi;

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  private messageEditEmitter: ((message: Message) => void) | null = null;

  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(ReadReceipt)
    private readonly receiptRepo: Repository<ReadReceipt>,
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatMember)
    private readonly chatMemberRepo: Repository<ChatMember>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly linkPreviewService: LinkPreviewService,
  ) {}

  setMessageEditEmitter(emitter: (message: Message) => void): void {
    this.messageEditEmitter = emitter;
  }

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
      isViewOnce: dto.isViewOnce ?? false,
    });

    const saved = await this.messageRepo.save(message);

    await this.chatRepo.update(chatId, { lastMessageAt: new Date() });

    const fullMessage = (await this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['sender', 'replyTo'],
    })) as Message;

    if ((dto.type ?? MessageType.TEXT) === MessageType.TEXT && dto.content) {
      this.fetchAndAttachLinkPreview(fullMessage.id, dto.content).catch((err) =>
        this.logger.debug(`Link preview extraction failed: ${err}`),
      );
    }

    return fullMessage;
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

  // ──── Pin ────

  async pin(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const member = await this.chatMemberRepo.findOne({
      where: { chatId: message.chatId, userId },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this chat');
    }
    if (
      member.role !== ChatMemberRole.OWNER &&
      member.role !== ChatMemberRole.ADMIN
    ) {
      throw new ForbiddenException('Only admins and owners can pin messages');
    }

    message.isPinned = !message.isPinned;
    return this.messageRepo.save(message);
  }

  // ──── Forward ────

  async forward(
    targetChatId: string,
    messageId: string,
    userId: string,
  ): Promise<Message> {
    const original = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!original) {
      throw new NotFoundException('Original message not found');
    }

    const targetChat = await this.chatRepo.findOne({
      where: { id: targetChatId },
    });
    if (!targetChat) {
      throw new NotFoundException('Target chat not found');
    }

    const membership = await this.chatMemberRepo.findOne({
      where: { chatId: targetChatId, userId },
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of the target chat');
    }

    const forwarded = this.messageRepo.create({
      chatId: targetChatId,
      senderId: userId,
      senderType: SenderType.USER,
      type: original.type,
      content: original.content,
      fileUrl: original.fileUrl,
      fileName: original.fileName,
      fileSize: original.fileSize,
      mimeType: original.mimeType,
      duration: original.duration,
      thumbnailUrl: original.thumbnailUrl,
      forwardedFromId: original.id,
    });

    const saved = await this.messageRepo.save(forwarded);

    await this.chatRepo.update(targetChatId, { lastMessageAt: new Date() });

    return this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['sender', 'forwardedFrom'],
    }) as Promise<Message>;
  }

  // ──── Message Status / Ticks ────

  async getMessageStatus(
    messageId: string,
  ): Promise<'sent' | 'delivered' | 'read'> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const receiptCount = await this.receiptRepo.count({
      where: { messageId },
    });
    if (receiptCount > 0) {
      return 'read';
    }

    return 'sent';
  }

  async getReadReceipts(messageId: string): Promise<ReadReceipt[]> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return this.receiptRepo.find({
      where: { messageId },
      relations: ['user'],
      order: { readAt: 'ASC' },
    });
  }

  async markChatAsRead(
    chatId: string,
    userId: string,
  ): Promise<{
    receipts: ReadReceipt[];
    senderMessageIds: Map<string, string[]>;
  }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const unreadMessages = await this.messageRepo
      .createQueryBuilder('msg')
      .leftJoin(
        ReadReceipt,
        'rr',
        'rr."messageId" = msg.id AND rr."userId" = :userId',
        { userId },
      )
      .where('msg."chatId" = :chatId', { chatId })
      .andWhere('msg."senderId" != :userId', { userId })
      .andWhere('rr.id IS NULL')
      .getMany();

    if (unreadMessages.length === 0) {
      return { receipts: [], senderMessageIds: new Map() };
    }

    const receipts: ReadReceipt[] = [];
    const senderMessageIds = new Map<string, string[]>();

    for (const msg of unreadMessages) {
      const sender = await this.userRepo.findOne({
        where: { id: msg.senderId },
      });
      const senderPrivacy = sender?.privacySettings as Record<string, unknown>;

      if (senderPrivacy?.readReceipts === false) {
        continue;
      }

      const receipt = this.receiptRepo.create({ messageId: msg.id, userId });
      receipts.push(receipt);

      const existing = senderMessageIds.get(msg.senderId) ?? [];
      existing.push(msg.id);
      senderMessageIds.set(msg.senderId, existing);
    }

    if (receipts.length > 0) {
      await this.receiptRepo.save(receipts);
    }

    return { receipts, senderMessageIds };
  }

  /**
   * Check if a message is "delivered" by seeing if the recipient
   * (any member except sender) has an active socket connection.
   * Called by the gateway which owns the socket map.
   */
  async getChatMemberIdsExcept(
    chatId: string,
    excludeUserId: string,
  ): Promise<string[]> {
    const members = await this.chatMemberRepo.find({
      where: { chatId },
      select: ['userId'],
    });
    return members.map((m) => m.userId).filter((id) => id !== excludeUserId);
  }

  // ──── Link Preview (async, non-blocking) ────

  private async fetchAndAttachLinkPreview(
    messageId: string,
    content: string,
  ): Promise<void> {
    const urls = content.match(URL_REGEX);
    if (!urls || urls.length === 0) return;

    const preview = await this.linkPreviewService.extractPreview(urls[0]);
    if (!preview) return;

    const message = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!message) return;

    message.metadata = {
      ...message.metadata,
      linkPreview: preview,
    };
    const updated = await this.messageRepo.save(message);

    const fullMessage = await this.messageRepo.findOne({
      where: { id: updated.id },
      relations: ['sender', 'replyTo'],
    });

    if (fullMessage && this.messageEditEmitter) {
      this.messageEditEmitter(fullMessage);
    }
  }
}
