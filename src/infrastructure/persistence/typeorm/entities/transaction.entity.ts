/**
 * Transaction TypeORM Entity - Infrastructure Layer
 
 * Mapea la tabla 'transactions' de PostgreSQL
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { CustomerTypeORM } from './customer.entity';
import { ProductOrmEntity } from './product.entity';
import { DeliveryTypeORM } from './delivery.entity';

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  ERROR = 'ERROR',
}

@Entity('transactions')
export class TransactionTypeORM {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'transaction_no' })
  transactionNo: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  // Cost breakdown
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'base_fee',
  })
  baseFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'delivery_fee' })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  // Payment gateway references
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'wompi_transaction_id',
  })
  wompiTransactionId: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'wompi_reference',
  })
  wompiReference: string | null;

  // Card info (non-sensitive)
  @Column({ type: 'varchar', length: 50, nullable: true, name: 'card_brand' })
  cardBrand: string | null;

  @Column({
    type: 'varchar',
    length: 4,
    nullable: true,
    name: 'card_last_four',
  })
  cardLastFour: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => CustomerTypeORM, (customer) => customer.transactions)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerTypeORM;

  @ManyToOne(() => ProductOrmEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductOrmEntity;

  @OneToOne(() => DeliveryTypeORM, (delivery) => delivery.transaction)
  delivery: DeliveryTypeORM;
}
