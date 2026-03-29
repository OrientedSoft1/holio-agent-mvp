import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('image_generations')
export class ImageGeneration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'text', nullable: true })
  negativePrompt: string | null;

  @Column({ default: 'TEXT_IMAGE' })
  taskType: string;

  @Column({ type: 'text', nullable: true, default: '' })
  resultUrl: string;

  @Column({ default: 1024 })
  width: number;

  @Column({ default: 1024 })
  height: number;

  @Column({ type: 'jsonb', default: {} })
  params: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
