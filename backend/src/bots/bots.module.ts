import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { BotsService } from './bots.service.js';
import { BotsController } from './bots.controller.js';
import { BedrockService } from './bedrock.service.js';
import { Bot } from './entities/bot.entity.js';
import { BotChatMember } from './entities/bot-chat-member.entity.js';
import { BotTask } from './entities/bot-task.entity.js';
import { BotTemplate } from './entities/bot-template.entity.js';
import { CompaniesModule } from '../companies/companies.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bot, BotChatMember, BotTask, BotTemplate]),
    BullModule.registerQueue({ name: 'bot-tasks' }),
    CompaniesModule,
  ],
  controllers: [BotsController],
  providers: [BotsService, BedrockService],
  exports: [BotsService, BedrockService],
})
export class BotsModule {}
