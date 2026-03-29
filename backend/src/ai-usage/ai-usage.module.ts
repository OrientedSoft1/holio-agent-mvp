import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIUsageController } from './ai-usage.controller.js';
import { AIUsageService } from './ai-usage.service.js';
import { BotTask } from '../bots/entities/bot-task.entity.js';
import { Bot } from '../bots/entities/bot.entity.js';
import { CompaniesModule } from '../companies/companies.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([BotTask, Bot]), CompaniesModule],
  controllers: [AIUsageController],
  providers: [AIUsageService],
})
export class AIUsageModule {}
