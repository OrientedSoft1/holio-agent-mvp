import { Module } from '@nestjs/common';
import { GifsController } from './gifs.controller.js';
import { GifsService } from './gifs.service.js';

@Module({
  controllers: [GifsController],
  providers: [GifsService],
})
export class GifsModule {}
