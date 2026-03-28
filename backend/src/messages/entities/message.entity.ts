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
import { Chat } from '../../chats/entities/chat.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { MessageType, SenderType } from '../../common/enums.js';

@Entity('messages')
@Index(['chatId', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  chatId: string;

  @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Column()
  senderId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'senderId' })
  sender: User | null;

  @Column({
    type: 'enum',
    enum: SenderType,
    default: SenderType.USER,
  })
  senderType: SenderType;

  @Column({ nullable: true })
  replyToId: string | null;

  @ManyToOne(() => Message, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'replyToId' })
  replyTo: Message | null;

  @Column({ nullable: true })
  forwardedFromId: string | null;

  @ManyToOne(() => Message, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'forwardedFromId' })
  forwardedFrom: Message | null;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ nullable: true })
  fileUrl: string | null;

  @Column({ nullable: true })
  fileName: string | null;

  @Column({ nullable: true })
  fileSize: number | null;

  @Column({ nullable: true })
  mimeType: string | null;

  @Column({ nullable: true })
  duration: number | null;

  @Column({ nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  editedAt: Date | null;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: false })
  isScheduled: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  scheduledAt: Date | null;

  @Column({ default: false })
  isViewOnce: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
