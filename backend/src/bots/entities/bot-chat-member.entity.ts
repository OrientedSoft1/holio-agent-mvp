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
import { Bot } from './bot.entity.js';
import { Chat } from '../../chats/entities/chat.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('bot_chat_members')
@Unique(['botId', 'chatId'])
export class BotChatMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  botId: string;

  @ManyToOne(() => Bot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'botId' })
  bot: Bot;

  @Index()
  @Column()
  chatId: string;

  @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Column()
  addedByUserId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'addedByUserId' })
  addedBy: User;

  @CreateDateColumn()
  addedAt: Date;
}
