import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  countryCode: string;

  @Index()
  @Column({ type: 'varchar', unique: true, nullable: true })
  username: string | null;

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  twoFaHash: string | null;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastSeen: Date | null;

  @Column({
    type: 'jsonb',
    default: {
      lastSeen: 'everybody',
      phone: 'contacts',
      profilePhoto: 'everybody',
      forwarding: true,
      readReceipts: true,
    },
  })
  privacySettings: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
