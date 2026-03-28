import { Module } from '@nestjs/common';
import { BotsService } from './bots.service.js';
import { BotsController } from './bots.controller.js';

@Module({
  controllers: [BotsController],
  providers: [BotsService],
  exports: [BotsService],
})
export class BotsModule {}
