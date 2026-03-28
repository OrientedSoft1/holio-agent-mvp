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
  ) {}

  afterInit() {
    this.logger.log('WebSocket gateway initialized');
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

  handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      this.userSockets.delete(userId);
      this.socketUsers.delete(client.id);

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
    @MessageBody() data: { messageId: string; chatId: string },
  ) {
    const userId = this.getSocketUserId(client);

    const receipt = await this.messagesService.markAsRead(
      data.messageId,
      userId,
    );

    this.server.to(`chat:${data.chatId}`).emit('message:read', {
      messageId: data.messageId,
      userId,
      readAt: receipt.readAt,
    });

    return receipt;
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

  private getSocketUserId(client: Socket): string {
    const userId = this.socketUsers.get(client.id);
    if (!userId) {
      throw new WsException('Not authenticated');
    }
    return userId;
  }
}
