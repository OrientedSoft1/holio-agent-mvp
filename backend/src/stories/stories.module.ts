import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoriesService } from './stories.service.js';
import { StoriesController } from './stories.controller.js';
import { Story } from './entities/story.entity.js';
import { StoryView } from './entities/story-view.entity.js';
import { ChatsModule } from '../chats/chats.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Story, StoryView]), ChatsModule],
  controllers: [StoriesController],
  providers: [StoriesService],
  exports: [StoriesService],
})
export class StoriesModule {}
