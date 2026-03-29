import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service.js';
import { MessagesController } from './messages.controller.js';
import { LinkPreviewService } from './link-preview.service.js';
import { Message } from './entities/message.entity.js';
import { ReadReceipt } from './entities/read-receipt.entity.js';
import { ChatsModule } from '../chats/chats.module.js';
import { UsersModule } from '../users/users.module.js';
import { BotsModule } from '../bots/bots.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, ReadReceipt]),
    ChatsModule,
    UsersModule,
    BotsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, LinkPreviewService],
  exports: [MessagesService, TypeOrmModule],
})
export class MessagesModule {}
