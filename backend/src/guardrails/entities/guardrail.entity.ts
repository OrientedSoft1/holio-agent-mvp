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

@Entity('guardrails')
export class Guardrail {
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

  @Column({ type: 'varchar', nullable: true })
  bedrockGuardrailId: string | null;

  @Column({ type: 'varchar', nullable: true })
  bedrockGuardrailVersion: string | null;

  @Column({ type: 'text', nullable: true })
  blockedInputMessaging: string | null;

  @Column({ type: 'text', nullable: true })
  blockedOutputsMessaging: string | null;

  @Column({ type: 'jsonb', default: [] })
  contentFilters: Record<string, any>[];

  @Column({ type: 'jsonb', default: [] })
  deniedTopics: Record<string, any>[];

  @Column({ type: 'jsonb', default: [] })
  wordFilters: string[];

  @Column({ type: 'jsonb', default: [] })
  sensitiveInfoTypes: Record<string, any>[];

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
