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
import { Message } from '../../messages/entities/message.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('reactions')
@Unique(['messageId', 'userId', 'emoji'])
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  messageId: string;

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  emoji: string;

  @CreateDateColumn()
  createdAt: Date;
}
