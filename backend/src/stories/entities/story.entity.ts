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
import { StoryPrivacy } from '../../common/enums.js';

@Entity('stories')
export class Story {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', nullable: true })
  companyId: string | null;

  @Column()
  mediaUrl: string;

  @Column()
  mediaType: string;

  @Column({ type: 'text', nullable: true })
  caption: string | null;

  @Column({
    type: 'enum',
    enum: StoryPrivacy,
    default: StoryPrivacy.CONTACTS,
  })
  privacyLevel: StoryPrivacy;

  @Column({ type: 'jsonb', default: [] })
  allowedUserIds: string[];

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
