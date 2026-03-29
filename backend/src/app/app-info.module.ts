import { Module } from '@nestjs/common';
import { AppInfoController } from './app-info.controller.js';

@Module({
  controllers: [AppInfoController],
})
export class AppInfoModule {}
