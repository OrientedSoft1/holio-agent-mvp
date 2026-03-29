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

@Entity('agents')
export class Agent {
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

  @Column()
  modelId: string;

  @Column({ type: 'text' })
  instruction: string;

  @Column({ type: 'jsonb', default: [] })
  actionGroups: Record<string, any>[];

  @Column({ type: 'jsonb', default: [] })
  knowledgeBaseIds: string[];

  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  bedrockAgentId: string | null;

  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
