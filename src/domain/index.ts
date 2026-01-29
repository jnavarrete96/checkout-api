/**
 * Domain Layer - Index

 * Exporta todas las entidades, repositorios y servicios del dominio
 */

// Entities
export * from './entities/Customer.entity';
export * from './entities/Product.entity';
export * from './entities/Transaction.entity';
export * from './entities/Delivery.entity';

// Repositories (PORTS)
export * from './repositories/Customer.repository';
export * from './repositories/Product.repository';
export * from './repositories/Transaction.repository';
export * from './repositories/Delivery.repository';

// Services (PORTS)
export * from './services/PaymentGateway.interface';
