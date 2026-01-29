import { Repository, MoreThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IProductRepository } from '../../../../domain';
import { Product } from '../../../../domain/entities/Product.entity';
import { ProductOrmEntity } from '../entities/product.entity';

export class ProductTypeOrmRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repository: Repository<ProductOrmEntity>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repository.findOne({
      where: { id, isActive: true },
    });

    return entity ? Product.fromPrimitives(entity) : null;
  }

  async findAllAvailable(): Promise<Product[]> {
    const entities = await this.repository.find({
      where: {
        isActive: true,
        stockQuantity: MoreThan(0),
      },
    });

    return entities.map((e) => Product.fromPrimitives(e));
  }

  async findAll(): Promise<Product[]> {
    const entities = await this.repository.find();
    return entities.map((e) => Product.fromPrimitives(e));
  }

  async update(product: Product): Promise<Product> {
    const plain = product.toObject();
    await this.repository.save(plain);
    return product;
  }

  async updateStock(id: string, newStock: number): Promise<void> {
    await this.repository.update({ id }, { stockQuantity: newStock });
  }
}
