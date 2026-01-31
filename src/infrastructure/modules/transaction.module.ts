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
import { WompiModule } from '@infrastructure/external/wompi/wompi.module';
import { ProcessPaymentUseCase } from '@application/use-cases/process-payment/process-payment.use-case';
import { WompiService } from '@infrastructure/external/wompi/wompi.service';
import { GetTransactionUseCase } from '@application/use-cases/get-transaction/get-transaction.use-case';
import { RecoverTransactionUseCase } from '@application/use-cases/recover-transaction/recover-transaction.use-case';

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
    WompiModule,
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
    {
      provide: ProcessPaymentUseCase,
      useFactory: (
        transactionRepo: ITransactionRepository,
        productRepo: IProductRepository,
        customerRepo: ICustomerRepository,
        wompiService: WompiService,
      ) => {
        return new ProcessPaymentUseCase(
          transactionRepo,
          productRepo,
          customerRepo,
          wompiService,
        );
      },
      inject: [
        TRANSACTION_REPOSITORY,
        PRODUCT_REPOSITORY,
        CUSTOMER_REPOSITORY,
        WompiService,
      ],
    },
    {
      provide: GetTransactionUseCase,
      useFactory: (
        transactionRepo: ITransactionRepository,
        customerRepo: ICustomerRepository,
        productRepo: IProductRepository,
        deliveryRepo: IDeliveryRepository,
      ) => {
        return new GetTransactionUseCase(
          transactionRepo,
          customerRepo,
          productRepo,
          deliveryRepo,
        );
      },
      inject: [
        TRANSACTION_REPOSITORY,
        CUSTOMER_REPOSITORY,
        PRODUCT_REPOSITORY,
        DELIVERY_REPOSITORY,
      ],
    },
    {
      provide: RecoverTransactionUseCase,
      useFactory: (
        transactionRepo: ITransactionRepository,
        customerRepo: ICustomerRepository,
        productRepo: IProductRepository,
        deliveryRepo: IDeliveryRepository,
      ) => {
        return new RecoverTransactionUseCase(
          transactionRepo,
          customerRepo,
          productRepo,
          deliveryRepo,
        );
      },
      inject: [
        TRANSACTION_REPOSITORY,
        CUSTOMER_REPOSITORY,
        PRODUCT_REPOSITORY,
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
