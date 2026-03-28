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
import { ChatType } from '../../common/enums.js';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ nullable: true })
  companyId: string | null;

  @ManyToOne(() => Company, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company | null;

  @Column({ type: 'enum', enum: ChatType })
  type: ChatType;

  @Column({ nullable: true })
  name: string | null;

  @Column({ nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: 0 })
  slowModeInterval: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastMessageAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
