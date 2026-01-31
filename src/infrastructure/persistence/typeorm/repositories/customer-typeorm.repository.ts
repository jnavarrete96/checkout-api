import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ICustomerRepository } from '../../../../domain';
import { Customer } from '../../../../domain/entities/Customer.entity';
import { CustomerTypeORM } from '../entities/customer.entity';

export class CustomerTypeOrmRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerTypeORM)
    private readonly repository: Repository<CustomerTypeORM>,
  ) {}

  async create(customer: Customer): Promise<Customer> {
    const plain = customer.toObject();
    await this.repository.save(plain);
    return customer;
  }

  async findById(id: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? Customer.fromPrimitives(entity) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? Customer.fromPrimitives(entity) : null;
  }

  async update(customer: Customer): Promise<Customer> {
    const plain = customer.toObject();
    await this.repository.update({ id: plain.id }, plain);
    return customer;
  }
}
