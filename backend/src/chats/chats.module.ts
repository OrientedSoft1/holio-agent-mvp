import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsService } from './chats.service.js';
import { ChatsController } from './chats.controller.js';
import { Chat } from './entities/chat.entity.js';
import { ChatMember } from './entities/chat-member.entity.js';
import { CompaniesModule } from '../companies/companies.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, ChatMember]), CompaniesModule],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService, TypeOrmModule],
})
export class ChatsModule {}
