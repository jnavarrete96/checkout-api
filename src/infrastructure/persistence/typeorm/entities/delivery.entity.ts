/**
 * Delivery TypeORM Entity - Infrastructure Layer
 
 * Mapea la tabla 'deliveries' de PostgreSQL
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { TransactionTypeORM } from './transaction.entity';

@Entity('deliveries')
export class DeliveryTypeORM {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true, name: 'transaction_id' })
  transactionId: string;

  @Column({ type: 'varchar', length: 255, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 500 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'postal_code' })
  postalCode: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToOne(() => TransactionTypeORM, (transaction) => transaction.delivery, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transaction_id' })
  transaction: TransactionTypeORM;
}
