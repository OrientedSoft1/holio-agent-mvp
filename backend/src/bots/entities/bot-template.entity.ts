import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('bot_templates')
export class BotTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  category: string;

  @Column({ type: 'text' })
  defaultSystemPrompt: string;

  @Column({ default: 'anthropic.claude-sonnet' })
  defaultModelId: string;

  @Column({ type: 'jsonb', default: [] })
  defaultTools: unknown[];

  @Column({ type: 'varchar', nullable: true })
  iconUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
