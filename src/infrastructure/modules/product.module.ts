import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductOrmEntity } from '../../infrastructure/persistence/typeorm/entities/product.entity';
import { ProductTypeOrmRepository } from '../../infrastructure/persistence/typeorm/repositories/product-typeorm.repository';
import { GetProductUseCase } from '../../application/use-cases/get-product/get-product.use-case';
import { ListProductsUseCase } from '../../application/use-cases/list-products/list-products.use-case';
import { ProductController } from '../http/controllers/product.controller';
import { IProductRepository } from '../../domain/repositories/Product.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity])],
  controllers: [ProductController],
  providers: [
    ProductTypeOrmRepository,
    {
      provide: 'IProductRepository',
      useClass: ProductTypeOrmRepository,
    },
    {
      provide: ListProductsUseCase,
      useFactory: (repo: IProductRepository) => new ListProductsUseCase(repo),
      inject: ['IProductRepository'],
    },
    {
      provide: GetProductUseCase,
      useFactory: (repo: IProductRepository) => new GetProductUseCase(repo),
      inject: ['IProductRepository'],
    },
  ],
})
export class ProductModule {}
