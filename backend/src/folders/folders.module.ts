import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoldersService } from './folders.service.js';
import { FoldersController } from './folders.controller.js';
import { ChatFolder } from './entities/chat-folder.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ChatFolder])],
  controllers: [FoldersController],
  providers: [FoldersService],
  exports: [FoldersService],
})
export class FoldersModule {}
