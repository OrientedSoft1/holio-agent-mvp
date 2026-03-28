import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service.js';
import { SearchController } from './search.controller.js';
import { Chat } from '../chats/entities/chat.entity.js';
import { ChatMember } from '../chats/entities/chat-member.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Message } from '../messages/entities/message.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, ChatMember, User, Message])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
