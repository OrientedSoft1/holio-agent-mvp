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

@Entity('agent_definitions')
export class AgentDefinition {
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

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ default: 'anthropic.claude-sonnet-4-20250514-v1:0' })
  modelId: string;

  @Column({ type: 'text' })
  instruction: string;

  @Column({ type: 'jsonb', default: [] })
  actionGroups: {
    name: string;
    description: string;
    lambdaArn?: string;
    apiSchema?: string;
  }[];

  @Column({ type: 'jsonb', default: [] })
  knowledgeBaseIds: string[];

  @Column({ type: 'varchar', nullable: true })
  bedrockAgentId: string | null;

  @Column({ type: 'varchar', nullable: true })
  bedrockAliasId: string | null;

  @Column({ default: 'draft' })
  status: 'draft' | 'deploying' | 'active' | 'failed';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
