/**
 * Transaction Module - Infrastructure Layer

 * Módulo que configura todo lo relacionado con transacciones:
 * - Controllers
 * - Use Cases
 * - Repositories
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities TypeORM
import { TransactionTypeORM } from '../persistence/typeorm/entities/transaction.entity';
import { CustomerTypeORM } from '../persistence/typeorm/entities/customer.entity';
import { ProductOrmEntity } from '../persistence/typeorm/entities/product.entity';
import { DeliveryTypeORM } from '../persistence/typeorm/entities/delivery.entity';
// Use Cases
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction/create-transaction.use-case';

// Controllers
import { TransactionController } from '../http/controllers/transaction.controller';

//Repositorios
import { CustomerTypeOrmRepository } from '@infrastructure/persistence/typeorm/repositories/customer-typeorm.repository';
import { DeliveryTypeOrmRepository } from '@infrastructure/persistence/typeorm/repositories/delivery-typeorm.repository';
import { TransactionTypeOrmRepository } from '@infrastructure/persistence/typeorm/repositories/transaction-typeorm.repository';
import { ProductTypeOrmRepository } from '@infrastructure/persistence/typeorm/repositories/product-typeorm.repository';
import {
  ICustomerRepository,
  IDeliveryRepository,
  IProductRepository,
  ITransactionRepository,
} from '@domain/index';

// Tokens para inyección de dependencias
export const CUSTOMER_REPOSITORY = 'ICustomerRepository';
export const PRODUCT_REPOSITORY = 'IProductRepository';
export const TRANSACTION_REPOSITORY = 'ITransactionRepository';
export const DELIVERY_REPOSITORY = 'IDeliveryRepository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransactionTypeORM,
      CustomerTypeORM,
      ProductOrmEntity,
      DeliveryTypeORM,
    ]),
  ],
  controllers: [TransactionController],
  providers: [
    // Repositories
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerTypeOrmRepository,
    },
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductTypeOrmRepository,
    },
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TransactionTypeOrmRepository,
    },
    {
      provide: DELIVERY_REPOSITORY,
      useClass: DeliveryTypeOrmRepository,
    },
    // Use Cases
    {
      provide: CreateTransactionUseCase,
      useFactory: (
        customerRepo: ICustomerRepository,
        productRepo: IProductRepository,
        transactionRepo: ITransactionRepository,
        deliveryRepo: IDeliveryRepository,
      ) => {
        return new CreateTransactionUseCase(
          customerRepo,
          productRepo,
          transactionRepo,
          deliveryRepo,
        );
      },
      inject: [
        CUSTOMER_REPOSITORY,
        PRODUCT_REPOSITORY,
        TRANSACTION_REPOSITORY,
        DELIVERY_REPOSITORY,
      ],
    },
  ],
  exports: [
    CUSTOMER_REPOSITORY,
    PRODUCT_REPOSITORY,
    TRANSACTION_REPOSITORY,
    DELIVERY_REPOSITORY,
  ],
})
export class TransactionModule {}
