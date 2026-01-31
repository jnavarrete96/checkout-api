/**
 * Customer TypeORM Entity - Infrastructure Layer
 * Mapea la tabla 'customers' de PostgreSQL
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TransactionTypeORM } from './transaction.entity';

@Entity('customers')
export class CustomerTypeORM {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => TransactionTypeORM, (transaction) => transaction.customer)
  transactions: TransactionTypeORM[];
}
