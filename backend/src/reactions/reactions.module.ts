import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionsService } from './reactions.service.js';
import { ReactionsController } from './reactions.controller.js';
import { Reaction } from './entities/reaction.entity.js';
import { Poll } from './entities/poll.entity.js';
import { PollVote } from './entities/poll-vote.entity.js';
import { MessagesModule } from '../messages/messages.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reaction, Poll, PollVote]),
    MessagesModule,
  ],
  controllers: [ReactionsController],
  providers: [ReactionsService],
  exports: [ReactionsService],
})
export class ReactionsModule {}
