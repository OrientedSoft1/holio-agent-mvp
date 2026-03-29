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
import { Company } from '../../companies/entities/company.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { BotType } from '../../common/enums.js';

@Entity('bots')
export class Bot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: BotType })
  type: BotType;

  @Column({ type: 'text' })
  systemPrompt: string;

  @Column({ default: 'anthropic.claude-sonnet' })
  modelId: string;

  @Column({ type: 'float', default: 0.7 })
  temperature: number;

  @Column({ default: 2048 })
  maxTokens: number;

  @Column({ type: 'varchar', nullable: true })
  knowledgeBaseId: string | null;

  @Column({ type: 'jsonb', default: [] })
  tools: unknown[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
