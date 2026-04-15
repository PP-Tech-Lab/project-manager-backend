import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity()
export class VerificationTokens {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  user!: UserEntity;

  @Column()
  tokenHash!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column()
  tokenType!: string;
}
