import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Bot } from './bot.entity.js';
import { Chat } from '../../chats/entities/chat.entity.js';
import { Message } from '../../messages/entities/message.entity.js';
import { BotTaskStatus } from '../../common/enums.js';

@Entity('bot_tasks')
@Index(['botId', 'createdAt'])
export class BotTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  botId: string;

  @ManyToOne(() => Bot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'botId' })
  bot: Bot;

  @Column()
  chatId: string;

  @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Column()
  triggerMessageId: string;

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'triggerMessageId' })
  triggerMessage: Message;

  @Column({
    type: 'enum',
    enum: BotTaskStatus,
    default: BotTaskStatus.QUEUED,
  })
  status: BotTaskStatus;

  @Column({ type: 'text', nullable: true })
  input: string | null;

  @Column({ type: 'text', nullable: true })
  output: string | null;

  @Column({ nullable: true })
  tokensUsed: number | null;

  @Column({ nullable: true })
  durationMs: number | null;

  @Column({ nullable: true })
  error: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
