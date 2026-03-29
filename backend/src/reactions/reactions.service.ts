import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from './entities/reaction.entity.js';
import { Poll, PollOption } from './entities/poll.entity.js';
import { PollVote } from './entities/poll-vote.entity.js';
import { Message } from '../messages/entities/message.entity.js';
import { CreatePollDto } from './dto/create-poll.dto.js';
import { MessageType, SenderType } from '../common/enums.js';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction)
    private readonly reactionRepo: Repository<Reaction>,
    @InjectRepository(Poll)
    private readonly pollRepo: Repository<Poll>,
    @InjectRepository(PollVote)
    private readonly pollVoteRepo: Repository<PollVote>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  // ──── Reactions ────

  async findPollByMessageId(messageId: string): Promise<Poll> {
    const poll = await this.pollRepo.findOne({ where: { messageId } });
    if (!poll) {
      throw new NotFoundException('Poll not found for this message');
    }
    return poll;
  }

  async addReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<{ action: 'added' | 'removed'; reaction?: Reaction }> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const existing = await this.reactionRepo.findOne({
      where: { messageId, userId, emoji },
    });

    if (existing) {
      await this.reactionRepo.remove(existing);
      return { action: 'removed' };
    }

    const reaction = this.reactionRepo.create({ messageId, userId, emoji });
    const saved = await this.reactionRepo.save(reaction);
    return { action: 'added', reaction: saved };
  }

  async removeReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<void> {
    const reaction = await this.reactionRepo.findOne({
      where: { messageId, userId, emoji },
    });
    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }
    await this.reactionRepo.remove(reaction);
  }

  async getReactions(messageId: string): Promise<
    {
      emoji: string;
      count: number;
      users: { id: string; firstName: string | null }[];
    }[]
  > {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const reactions = await this.reactionRepo.find({
      where: { messageId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    const grouped = new Map<
      string,
      { id: string; firstName: string | null }[]
    >();
    for (const r of reactions) {
      const users = grouped.get(r.emoji) ?? [];
      users.push({ id: r.user.id, firstName: r.user.firstName ?? null });
      grouped.set(r.emoji, users);
    }

    return Array.from(grouped.entries()).map(([emoji, users]) => ({
      emoji,
      count: users.length,
      users,
    }));
  }

  // ──── Polls ────

  async createPoll(
    userId: string,
    dto: CreatePollDto,
  ): Promise<{ poll: Poll; message: Message }> {
    const message = this.messageRepo.create({
      chatId: dto.chatId,
      senderId: userId,
      senderType: SenderType.USER,
      type: MessageType.POLL,
      content: dto.question,
    });
    const savedMessage = await this.messageRepo.save(message);

    const poll = this.pollRepo.create({
      messageId: savedMessage.id,
      question: dto.question,
      options: dto.options as PollOption[],
      isAnonymous: dto.isAnonymous ?? false,
      isQuiz: dto.isQuiz ?? false,
      correctOptionIndex: dto.correctOptionIndex ?? null,
      allowMultiple: dto.allowMultiple ?? false,
      closesAt: dto.closesAt ? new Date(dto.closesAt) : null,
      creatorId: userId,
    });
    const savedPoll = await this.pollRepo.save(poll);

    const fullMessage = await this.messageRepo.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });

    return { poll: savedPoll, message: fullMessage as Message };
  }

  async vote(
    pollId: string,
    userId: string,
    optionIndex: number,
  ): Promise<PollVote> {
    const poll = await this.pollRepo.findOne({ where: { id: pollId } });
    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    if (poll.isClosed) {
      throw new BadRequestException('Poll is closed');
    }
    if (poll.closesAt && new Date() > poll.closesAt) {
      poll.isClosed = true;
      await this.pollRepo.save(poll);
      throw new BadRequestException('Poll has expired');
    }

    const validIndices = poll.options.map((o) => o.index);
    if (!validIndices.includes(optionIndex)) {
      throw new BadRequestException('Invalid option index');
    }

    if (!poll.allowMultiple) {
      await this.pollVoteRepo.delete({ pollId, userId });
    }

    const existingVote = await this.pollVoteRepo.findOne({
      where: { pollId, userId, optionIndex },
    });
    if (existingVote) {
      await this.pollVoteRepo.remove(existingVote);
      return existingVote;
    }

    const vote = this.pollVoteRepo.create({ pollId, userId, optionIndex });
    return this.pollVoteRepo.save(vote);
  }

  async getResults(
    pollId: string,
    userId: string,
  ): Promise<{
    poll: Poll;
    results: {
      optionIndex: number;
      text: string;
      count: number;
      voters?: { id: string; firstName: string | null }[];
    }[];
    totalVotes: number;
    userVotes: number[];
  }> {
    const poll = await this.pollRepo.findOne({ where: { id: pollId } });
    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    const votes = await this.pollVoteRepo.find({
      where: { pollId },
      relations: poll.isAnonymous ? [] : ['user'],
    });

    const userVotes = votes
      .filter((v) => v.userId === userId)
      .map((v) => v.optionIndex);

    const results = poll.options.map((option) => {
      const optionVotes = votes.filter((v) => v.optionIndex === option.index);
      const result: {
        optionIndex: number;
        text: string;
        count: number;
        voters?: { id: string; firstName: string | null }[];
        isCorrect?: boolean;
      } = {
        optionIndex: option.index,
        text: option.text,
        count: optionVotes.length,
      };

      if (!poll.isAnonymous) {
        result.voters = optionVotes.map((v) => ({
          id: v.user?.id ?? v.userId,
          firstName: v.user?.firstName ?? null,
        }));
      }

      if (poll.isQuiz) {
        result.isCorrect = option.index === poll.correctOptionIndex;
      }

      return result;
    });

    return {
      poll,
      results,
      totalVotes: votes.length,
      userVotes,
    };
  }

  async closePoll(pollId: string, userId: string): Promise<Poll> {
    const poll = await this.pollRepo.findOne({ where: { id: pollId } });
    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    if (poll.creatorId !== userId) {
      throw new ForbiddenException('Only the poll creator can close it');
    }
    if (poll.isClosed) {
      throw new BadRequestException('Poll is already closed');
    }

    poll.isClosed = true;
    return this.pollRepo.save(poll);
  }
}
