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
import { Chat } from './chat.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { ChatMemberRole } from '../../common/enums.js';

@Entity('chat_members')
@Unique(['chatId', 'userId'])
export class ChatMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  chatId: string;

  @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ChatMemberRole,
    default: ChatMemberRole.MEMBER,
  })
  role: ChatMemberRole;

  @Column({ type: 'jsonb', default: {} })
  permissions: Record<string, unknown>;

  @Column({ type: 'timestamptz', nullable: true })
  mutedUntil: Date | null;

  @CreateDateColumn()
  joinedAt: Date;
}
