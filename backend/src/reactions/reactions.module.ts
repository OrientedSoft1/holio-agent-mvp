import { Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service.js';
import { ReactionsController } from './reactions.controller.js';

@Module({
  controllers: [ReactionsController],
  providers: [ReactionsService],
  exports: [ReactionsService],
})
export class ReactionsModule {}
