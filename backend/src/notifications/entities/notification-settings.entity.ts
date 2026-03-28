import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('notification_settings')
@Unique(['userId', 'chatId'])
export class NotificationSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  chatId: string;

  @Column({ default: false })
  muted: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  mutedUntil: Date | null;

  @Column({ type: 'varchar', nullable: true })
  customSound: string | null;
}
