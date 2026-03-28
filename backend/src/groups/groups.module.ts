import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsService } from './groups.service.js';
import { GroupsController } from './groups.controller.js';
import { Chat } from '../chats/entities/chat.entity.js';
import { ChatMember } from '../chats/entities/chat-member.entity.js';
import { Message } from '../messages/entities/message.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CompaniesModule } from '../companies/companies.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMember, Message, User]),
    CompaniesModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
