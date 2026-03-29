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
import { User } from '../../users/entities/user.entity.js';
import { Chat } from '../../chats/entities/chat.entity.js';

export enum CallDirection {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
  MISSED = 'missed',
}

export enum CallType {
  VOICE = 'voice',
  VIDEO = 'video',
}

@Entity('calls')
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_calls_callerId')
  @Column()
  callerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', createForeignKeyConstraints: false })
  @JoinColumn({ name: 'callerId' })
  caller: User;

  @Index('IDX_calls_receiverId')
  @Column()
  receiverId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', createForeignKeyConstraints: false })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column({ nullable: true })
  chatId: string | null;

  @ManyToOne(() => Chat, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat | null;

  @Column({ type: 'enum', enum: CallDirection })
  direction: CallDirection;

  @Column({ type: 'enum', enum: CallType })
  callType: CallType;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  duration: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
