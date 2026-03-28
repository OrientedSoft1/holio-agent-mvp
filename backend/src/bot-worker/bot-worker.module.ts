import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { BotWorkerService } from './bot-worker.service.js';
import { BotTask } from '../bots/entities/bot-task.entity.js';
import { Bot } from '../bots/entities/bot.entity.js';
import { Message } from '../messages/entities/message.entity.js';
import { Company } from '../companies/entities/company.entity.js';
import { BedrockService } from '../bots/bedrock.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([BotTask, Bot, Message, Company]),
    BullModule.registerQueue({ name: 'bot-tasks' }),
  ],
  providers: [BotWorkerService, BedrockService],
  exports: [BotWorkerService],
})
export class BotWorkerModule {}
