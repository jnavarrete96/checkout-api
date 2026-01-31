import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ITransactionRepository } from '../../../../domain';
import { Transaction } from '../../../../domain/entities/Transaction.entity';
import { TransactionTypeORM } from '../entities/transaction.entity';
import { TransactionStatus } from '@shared/types/TransactionStatus';

export class TransactionTypeOrmRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(TransactionTypeORM)
    private readonly repository: Repository<TransactionTypeORM>,
  ) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const plain = transaction.toObject();

    await this.repository.save({
      ...plain,
      status: plain.status as TransactionStatus, // 👈 ya es el mismo enum
    });

    return transaction;
  }

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? Transaction.fromPrimitives(entity) : null;
  }

  async findByTransactionNo(
    transactionNo: string,
  ): Promise<Transaction | null> {
    const entity = await this.repository.findOne({ where: { transactionNo } });
    return entity ? Transaction.fromPrimitives(entity) : null;
  }

  async findByCustomerId(customerId: string): Promise<Transaction[]> {
    const entities = await this.repository.find({ where: { customerId } });
    return entities.map((e) => Transaction.fromPrimitives(e));
  }

  async findPendingByCustomerId(
    customerId: string,
  ): Promise<Transaction | null> {
    const entity = await this.repository.findOne({
      where: { customerId, status: TransactionStatus.PENDING }, // 👈 enum compartido
      order: { createdAt: 'DESC' },
    });
    return entity ? Transaction.fromPrimitives(entity) : null;
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const plain = transaction.toObject();

    // Usamos update explícito en lugar de save
    await this.repository.update(
      { id: plain.id }, // condición de búsqueda
      {
        transactionNo: plain.transactionNo,
        productId: plain.productId,
        customerId: plain.customerId,
        status: plain.status as TransactionStatus,
        amount: plain.amount,
        baseFee: plain.baseFee,
        deliveryFee: plain.deliveryFee,
        totalAmount: plain.totalAmount,
        wompiTransactionId: plain.wompiTransactionId,
        wompiReference: plain.wompiReference,
        cardBrand: plain.cardBrand,
        cardLastFour: plain.cardLastFour,
        updatedAt: new Date(), // 👈 importante: actualizar timestamp
      },
    );

    return transaction;
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<void> {
    await this.repository.update({ id }, { status }); // 👈 ya no hay incompatibilidad
  }

  async findAll(): Promise<Transaction[]> {
    const entities = await this.repository.find();
    return entities.map((e) => Transaction.fromPrimitives(e));
  }
}
