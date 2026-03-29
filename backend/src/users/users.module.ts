import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { User } from './entities/user.entity.js';
import { Message } from '../messages/entities/message.entity.js';
import { Chat } from '../chats/entities/chat.entity.js';
import { ChatMember } from '../chats/entities/chat-member.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Message, Chat, ChatMember])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
