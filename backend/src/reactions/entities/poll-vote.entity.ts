import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Poll } from './poll.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('poll_votes')
@Unique(['pollId', 'userId', 'optionIndex'])
export class PollVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  pollId: string;

  @ManyToOne(() => Poll, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pollId' })
  poll: Poll;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' })
  optionIndex: number;

  @CreateDateColumn()
  createdAt: Date;
}
