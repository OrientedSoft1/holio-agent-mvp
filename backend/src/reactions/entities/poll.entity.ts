import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Message } from '../../messages/entities/message.entity.js';

export interface PollOption {
  text: string;
  index: number;
}

@Entity('polls')
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  messageId: string;

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @Column()
  question: string;

  @Column({ type: 'jsonb' })
  options: PollOption[];

  @Column({ default: false })
  isAnonymous: boolean;

  @Column({ default: false })
  isQuiz: boolean;

  @Column({ type: 'int', nullable: true })
  correctOptionIndex: number | null;

  @Column({ default: false })
  allowMultiple: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  closesAt: Date | null;

  @Column({ default: false })
  isClosed: boolean;

  @Column()
  creatorId: string;

  @CreateDateColumn()
  createdAt: Date;
}
