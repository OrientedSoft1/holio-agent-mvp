import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Story } from './story.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('story_views')
@Unique(['storyId', 'viewerId'])
export class StoryView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  storyId: string;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storyId' })
  story: Story;

  @Column()
  viewerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'viewerId' })
  viewer: User;

  @Column({ type: 'varchar', nullable: true })
  reaction: string | null;

  @CreateDateColumn()
  viewedAt: Date;
}
