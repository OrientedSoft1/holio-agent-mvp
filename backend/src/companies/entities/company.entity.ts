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

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index()
  @Column({ unique: true })
  slug: string;

  @Column({ type: 'varchar', nullable: true })
  logoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column()
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({
    type: 'jsonb',
    default: { allowCrossCompany: false, allowBots: true, maxMembers: 100 },
  })
  settings: Record<string, unknown>;

  @Column({ type: 'varchar', nullable: true })
  bedrockEndpoint: string | null;

  @Column({ default: 'eu-west-1' })
  bedrockRegion: string;

  @Column({ type: 'jsonb', nullable: true })
  bedrockConfig: {
    accessKeyId?: string;
    secretAccessKey?: string;
    allowedModels?: string[];
    guardrailId?: string;
    guardrailVersion?: string;
    defaultModelId?: string;
    maxTokensBudget?: number;
    kbRoleArn?: string;
    aossCollectionArn?: string;
    aossIndexName?: string;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  openaiConfig: {
    apiKey?: string;
    organizationId?: string;
    defaultModelId?: string;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  geminiConfig: {
    apiKey?: string;
    defaultModelId?: string;
  } | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
