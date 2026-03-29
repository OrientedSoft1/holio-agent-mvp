import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatsService } from '../chats/chats.service.js';
import { MessagesService } from '../messages/messages.service.js';
import { UsersService } from '../users/users.service.js';
import { BotsService } from '../bots/bots.service.js';
import { BotWorkerService } from '../bot-worker/bot-worker.service.js';
import { ReactionsService } from '../reactions/reactions.service.js';

interface AuthPayload {
  sub: string;
  [key: string]: unknown;
}

@WebSocketGateway({
  cors: { origin: '*' },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('AppGateway');
  private userSockets = new Map<string, string>();
  private socketUsers = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
    private readonly botsService: BotsService,
    private readonly botWorkerService: BotWorkerService,
    private readonly reactionsService: ReactionsService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket gateway initialized');

    this.messagesService.setMessageEditEmitter((message) => {
      this.server.to(`chat:${message.chatId}`).emit('message:edit', message);
    });

    this.messagesService.setScheduledMessageEmitter((chatId, message) => {
      this.server.to(`chat:${chatId}`).emit('message:new', message);
    });

    this.botWorkerService.setMessageEmitter((chatId, message) => {
      this.server.to(`chat:${chatId}`).emit('message:new', message);
    });
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth as { token?: string })?.token ??
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new WsException('Missing authentication token');
      }

      const payload = this.jwtService.verify<AuthPayload>(token);
      const userId = payload.sub;

      this.userSockets.set(userId, client.id);
      this.socketUsers.set(client.id, userId);

      (client as Socket & { userId: string }).userId = userId;

      await this.joinUserRooms(userId, client);

      await this.usersService.setOnline(userId);

      this.logger.log(`Client connected: ${client.id} (user: ${userId})`);

      this.server.emit('presence:update', {
        userId,
        isOnline: true,
      });
    } catch {
      this.logger.warn(`Auth failed for client ${client.id}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      this.userSockets.delete(userId);
      this.socketUsers.delete(client.id);

      await this.usersService.setOffline(userId);

      this.server.emit('presence:update', {
        userId,
        isOnline: false,
      });

      this.logger.log(`Client disconnected: ${client.id} (user: ${userId})`);
    }
  }

  // ──── Messages ────

  @SubscribeMessage('message:send')
  async handleMessageSend(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      chatId: string;
      content?: string;
      type?: string;
      replyToId?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      duration?: number;
      thumbnailUrl?: string;
    },
  ) {
    const userId = this.getSocketUserId(client);

    await this.chatsService.checkMembership(data.chatId, userId);

    const message = await this.messagesService.create(data.chatId, userId, {
      content: data.content,
      type: data.type as never,
      replyToId: data.replyToId,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      duration: data.duration,
      thumbnailUrl: data.thumbnailUrl,
    });

    this.server.to(`chat:${data.chatId}`).emit('message:new', message);

    if (data.content) {
      this.botsService
        .handleMentions(data.content, data.chatId, message.id)
        .catch((err) =>
          this.logger.debug(`Bot mention handling failed: ${err}`),
        );
    }

    const recipientIds = await this.messagesService.getChatMemberIdsExcept(
      data.chatId,
      userId,
    );
    const isDelivered = recipientIds.some((id) => this.userSockets.has(id));
    if (isDelivered) {
      client.emit('message:status', {
        messageId: message.id,
        status: 'delivered',
      });
    }

    return message;
  }

  @SubscribeMessage('message:edit')
  async handleMessageEdit(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; content: string },
  ) {
    const userId = this.getSocketUserId(client);

    const message = await this.messagesService.update(
      data.messageId,
      userId,
      data.content,
    );

    this.server.to(`chat:${message.chatId}`).emit('message:edit', message);

    return message;
  }

  @SubscribeMessage('message:delete')
  async handleMessageDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    const userId = this.getSocketUserId(client);

    const result = await this.messagesService.remove(data.messageId, userId);

    this.server.to(`chat:${result.chatId}`).emit('message:delete', {
      messageId: data.messageId,
      chatId: result.chatId,
    });

    return { success: true };
  }

  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = this.getSocketUserId(client);

    const { receipts, senderMessageIds } =
      await this.messagesService.markChatAsRead(data.chatId, userId);

    for (const receipt of receipts) {
      this.server.to(`chat:${data.chatId}`).emit('message:read', {
        messageId: receipt.messageId,
        userId,
        readAt: receipt.readAt,
      });
    }

    for (const [senderId, messageIds] of senderMessageIds.entries()) {
      const senderSocketId = this.userSockets.get(senderId);
      if (senderSocketId) {
        this.server.to(senderSocketId).emit('message:status', {
          chatId: data.chatId,
          messageIds,
          status: 'read',
          readBy: userId,
        });
      }
    }

    return { marked: receipts.length };
  }

  // ──── Pin ────

  @SubscribeMessage('message:pin')
  async handleMessagePin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    const userId = this.getSocketUserId(client);

    const message = await this.messagesService.pin(data.messageId, userId);

    this.server.to(`chat:${message.chatId}`).emit('message:pin', {
      messageId: message.id,
      chatId: message.chatId,
      isPinned: message.isPinned,
      pinnedBy: userId,
    });

    return message;
  }

  // ──── Forward ────

  @SubscribeMessage('message:forward')
  async handleMessageForward(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; targetChatId: string },
  ) {
    const userId = this.getSocketUserId(client);

    const message = await this.messagesService.forward(
      data.targetChatId,
      data.messageId,
      userId,
    );

    this.server.to(`chat:${data.targetChatId}`).emit('message:new', message);

    return message;
  }

  // ──── Reactions ────

  @SubscribeMessage('reaction:add')
  async handleReactionAdd(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; emoji: string },
  ) {
    const userId = this.getSocketUserId(client);

    const result = await this.reactionsService.addReaction(
      data.messageId,
      userId,
      data.emoji,
    );

    const chatId = await this.getMessageChatId(data.messageId);
    if (chatId) {
      this.server.to(`chat:${chatId}`).emit('reaction:update', {
        messageId: data.messageId,
        userId,
        emoji: data.emoji,
        action: result.action,
      });
    }

    return result;
  }

  @SubscribeMessage('reaction:remove')
  async handleReactionRemove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; emoji: string },
  ) {
    const userId = this.getSocketUserId(client);

    await this.reactionsService.removeReaction(
      data.messageId,
      userId,
      data.emoji,
    );

    const chatId = await this.getMessageChatId(data.messageId);
    if (chatId) {
      this.server.to(`chat:${chatId}`).emit('reaction:update', {
        messageId: data.messageId,
        userId,
        emoji: data.emoji,
        action: 'removed',
      });
    }

    return { success: true };
  }

  @SubscribeMessage('poll:vote')
  async handlePollVote(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pollId: string; optionIndex: number },
  ) {
    const userId = this.getSocketUserId(client);

    const vote = await this.reactionsService.vote(
      data.pollId,
      userId,
      data.optionIndex,
    );

    const results = await this.reactionsService.getResults(data.pollId, userId);

    if (results.poll.messageId) {
      const chatId = await this.getMessageChatId(results.poll.messageId);
      if (chatId) {
        this.server.to(`chat:${chatId}`).emit('poll:update', {
          pollId: data.pollId,
          results,
        });
      }
    }

    return vote;
  }

  // ──── Typing ────

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = this.getSocketUserId(client);

    client.to(`chat:${data.chatId}`).emit('typing:update', {
      chatId: data.chatId,
      userId,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = this.getSocketUserId(client);

    client.to(`chat:${data.chatId}`).emit('typing:update', {
      chatId: data.chatId,
      userId,
      isTyping: false,
    });
  }

  // ──── Chat updates ────

  @SubscribeMessage('chat:mute')
  async handleChatMute(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; duration?: string },
  ) {
    const userId = this.getSocketUserId(client);
    await this.chatsService.checkMembership(data.chatId, userId);

    this.server.to(client.id).emit('chat:update', {
      id: data.chatId,
      muted: true,
    });

    return { success: true };
  }

  @SubscribeMessage('chat:unmute')
  async handleChatUnmute(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = this.getSocketUserId(client);
    await this.chatsService.checkMembership(data.chatId, userId);

    this.server.to(client.id).emit('chat:update', {
      id: data.chatId,
      muted: false,
    });

    return { success: true };
  }

  // ──── Room management ────

  @SubscribeMessage('chat:join')
  async handleChatJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = this.getSocketUserId(client);

    await this.chatsService.checkMembership(data.chatId, userId);
    await client.join(`chat:${data.chatId}`);

    return { joined: data.chatId };
  }

  @SubscribeMessage('chat:leave')
  handleChatLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    client.leave(`chat:${data.chatId}`);
    return { left: data.chatId };
  }

  // ──── Helpers ────

  private async joinUserRooms(userId: string, client: Socket) {
    const chats = await this.chatsService.findAllForUser(userId);
    const roomNames = chats.map((c) => `chat:${c.id}`);
    if (roomNames.length > 0) {
      await client.join(roomNames);
    }
  }

  getUserSocketId(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }

  broadcastChatUpdate(chatId: string, updates: Record<string, unknown>) {
    this.server.to(`chat:${chatId}`).emit('chat:update', {
      id: chatId,
      ...updates,
    });
  }

  private async getMessageChatId(messageId: string): Promise<string | null> {
    return this.messagesService.getMessageChatId(messageId);
  }

  private getSocketUserId(client: Socket): string {
    const userId = this.socketUsers.get(client.id);
    if (!userId) {
      throw new WsException('Not authenticated');
    }
    return userId;
  }
}
