import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IDeliveryRepository } from '../../../../domain';
import { Delivery } from '../../../../domain/entities/Delivery.entity';
import { DeliveryTypeORM } from '../entities/delivery.entity';

export class DeliveryTypeOrmRepository implements IDeliveryRepository {
  constructor(
    @InjectRepository(DeliveryTypeORM)
    private readonly repository: Repository<DeliveryTypeORM>,
  ) {}

  async create(delivery: Delivery): Promise<Delivery> {
    const plain = delivery.toObject();
    await this.repository.save(plain);
    return delivery;
  }

  async findById(id: string): Promise<Delivery | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? Delivery.fromPrimitives(entity) : null;
  }

  async findByTransactionId(transactionId: string): Promise<Delivery | null> {
    const entity = await this.repository.findOne({ where: { transactionId } });
    return entity ? Delivery.fromPrimitives(entity) : null;
  }

  async update(delivery: Delivery): Promise<Delivery> {
    const plain = delivery.toObject();
    await this.repository.update({ id: plain.id }, plain);
    return delivery;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
