import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, IsNull } from 'typeorm';
import { Message } from './entities/message.entity.js';
import { ReadReceipt } from './entities/read-receipt.entity.js';
import { Chat } from '../chats/entities/chat.entity.js';
import { ChatMember } from '../chats/entities/chat-member.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { ScheduleMessageDto } from './dto/schedule-message.dto.js';
import { LinkPreviewService } from './link-preview.service.js';
import {
  MessageType,
  SenderType,
  ChatType,
  ChatMemberRole,
} from '../common/enums.js';

const EDIT_WINDOW_MS = 48 * 60 * 60 * 1000;

const URL_REGEX = /https?:\/\/[^\s<>]+/gi;

const SCHEDULED_CHECK_INTERVAL_MS = 30_000;

@Injectable()
export class MessagesService implements OnModuleInit {
  private readonly logger = new Logger(MessagesService.name);

  private messageEditEmitter: ((message: Message) => void) | null = null;
  private scheduledMessageEmitter:
    | ((chatId: string, message: Message) => void)
    | null = null;
  private scheduledInterval: ReturnType<typeof setInterval> | null = null;

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

  setScheduledMessageEmitter(
    emitter: (chatId: string, message: Message) => void,
  ): void {
    this.scheduledMessageEmitter = emitter;
  }

  onModuleInit() {
    this.scheduledInterval = setInterval(() => {
      void this.sendScheduledMessages().catch((err) =>
        this.logger.error(`Scheduled messages check failed: ${err}`),
      );
    }, SCHEDULED_CHECK_INTERVAL_MS);
    this.logger.log('Scheduled messages checker started');
  }

  onModuleDestroy() {
    if (this.scheduledInterval) {
      clearInterval(this.scheduledInterval);
    }
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

  async findByChatId(
    chatId: string,
    page = 1,
    limit = 50,
    filters?: { pinned?: boolean },
  ) {
    const where: Record<string, unknown> = { chatId, scheduledAt: IsNull() };
    if (filters?.pinned) {
      where.isPinned = true;
    }

    const [data, total] = await this.messageRepo.findAndCount({
      where,
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

  async getGroupReadReceipts(
    messageId: string,
    userId: string,
  ): Promise<ReadReceipt[]> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['chat'],
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException(
        'Only the sender can view group read receipts',
      );
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    if (message.createdAt < sevenDaysAgo) {
      return [];
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
      if (!msg.senderId) continue;

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

  async getMessageChatId(messageId: string): Promise<string | null> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
      select: ['id', 'chatId'],
    });
    return message?.chatId ?? null;
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

  // ──── Scheduled Messages ────

  async scheduleMessage(
    chatId: string,
    userId: string,
    dto: ScheduleMessageDto,
  ): Promise<Message> {
    const scheduledAt = new Date(dto.scheduledAt);
    if (scheduledAt <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    const message = this.messageRepo.create({
      chatId,
      senderId: userId,
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
      isScheduled: true,
      scheduledAt,
    });

    return this.messageRepo.save(message);
  }

  async getScheduledMessages(chatId: string, userId: string) {
    return this.messageRepo.find({
      where: { chatId, senderId: userId, isScheduled: true },
      order: { scheduledAt: 'ASC' },
      relations: ['sender'],
    });
  }

  async cancelScheduledMessage(
    messageId: string,
    userId: string,
  ): Promise<void> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.senderId !== userId) {
      throw new ForbiddenException(
        'You can only cancel your own scheduled messages',
      );
    }
    if (!message.isScheduled) {
      throw new BadRequestException('Message is not scheduled');
    }
    await this.messageRepo.remove(message);
  }

  async sendScheduledMessages(): Promise<number> {
    const now = new Date();
    const messages = await this.messageRepo.find({
      where: {
        isScheduled: true,
        scheduledAt: LessThanOrEqual(now),
      },
      relations: ['sender', 'replyTo'],
    });

    let sent = 0;
    for (const message of messages) {
      message.isScheduled = false;
      message.scheduledAt = null;
      await this.messageRepo.save(message);
      await this.chatRepo.update(message.chatId, { lastMessageAt: new Date() });

      if (this.scheduledMessageEmitter) {
        this.scheduledMessageEmitter(message.chatId, message);
      }
      sent++;
    }

    if (sent > 0) {
      this.logger.log(`Sent ${sent} scheduled message(s)`);
    }
    return sent;
  }

  // ──── Saved Messages ────

  async getOrCreateSavedMessagesChat(userId: string): Promise<Chat> {
    const existing = await this.chatRepo
      .createQueryBuilder('chat')
      .innerJoin(
        ChatMember,
        'cm',
        'cm."chatId" = chat.id AND cm."userId" = :userId',
        { userId },
      )
      .where('chat.type = :type', { type: ChatType.DM })
      .andWhere("chat.metadata->>'isSavedMessages' = :flag", { flag: 'true' })
      .getOne();

    if (existing) return existing;

    const chat = this.chatRepo.create({
      type: ChatType.DM,
      name: 'Saved Messages',
      metadata: { isSavedMessages: true },
    });
    const saved = await this.chatRepo.save(chat);

    const member = this.chatMemberRepo.create({
      chatId: saved.id,
      userId,
      role: ChatMemberRole.OWNER,
    });
    await this.chatMemberRepo.save(member);

    return saved;
  }

  async getSavedMessages(userId: string) {
    const chat = await this.getOrCreateSavedMessagesChat(userId);
    return this.findByChatId(chat.id);
  }

  async sendScheduledNow(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId, senderId: userId, isScheduled: true },
      relations: ['sender'],
    });
    if (!message) {
      throw new NotFoundException('Scheduled message not found');
    }
    message.isScheduled = false;
    message.scheduledAt = null;
    return this.messageRepo.save(message);
  }

  async getMediaCounts(chatId: string) {
    const result = await this.messageRepo
      .createQueryBuilder('m')
      .select('m.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('m.chatId = :chatId', { chatId })
      .andWhere('m.type != :text', { text: 'text' })
      .groupBy('m.type')
      .getRawMany<{ type: string; count: string }>();

    const counts: Record<string, number> = {};
    for (const row of result) {
      counts[row.type] = parseInt(row.count, 10);
    }
    return counts;
  }

  async saveMessage(messageId: string, userId: string): Promise<Message> {
    const original = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!original) {
      throw new NotFoundException('Message not found');
    }

    const savedChat = await this.getOrCreateSavedMessagesChat(userId);

    const forwarded = this.messageRepo.create({
      chatId: savedChat.id,
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
      metadata: { savedFromChatId: original.chatId },
    });

    const saved = await this.messageRepo.save(forwarded);
    await this.chatRepo.update(savedChat.id, { lastMessageAt: new Date() });

    return this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['sender', 'forwardedFrom'],
    }) as Promise<Message>;
  }

  async unsaveMessage(userId: string, messageId: string): Promise<void> {
    const savedChat = await this.getOrCreateSavedMessagesChat(userId);

    const message = await this.messageRepo.findOne({
      where: { id: messageId, chatId: savedChat.id },
    });
    if (!message) {
      throw new NotFoundException('Saved message not found');
    }

    await this.messageRepo.remove(message);
  }
}
