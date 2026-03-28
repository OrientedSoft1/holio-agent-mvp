import { Module } from '@nestjs/common';
import { BotWorkerService } from './bot-worker.service.js';

@Module({
  providers: [BotWorkerService],
  exports: [BotWorkerService],
})
export class BotWorkerModule {}
