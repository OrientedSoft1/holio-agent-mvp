import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Company } from './company.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { CompanyRole } from '../../common/enums.js';

@Entity('company_members')
@Unique(['companyId', 'userId'])
export class CompanyMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: CompanyRole, default: CompanyRole.MEMBER })
  role: CompanyRole;

  @Column({ type: 'jsonb', default: {} })
  permissions: Record<string, unknown>;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  invitedById: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invitedById' })
  invitedBy: User | null;
}
