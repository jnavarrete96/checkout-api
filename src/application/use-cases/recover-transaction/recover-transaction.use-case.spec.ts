/**
 * Recover Transaction Use Case Test
 */

import { RecoverTransactionUseCase } from './recover-transaction.use-case';
import { Transaction } from '../../../domain/entities/Transaction.entity';
import { Customer } from '../../../domain/entities/Customer.entity';
import { Product } from '../../../domain/entities/Product.entity';
import { Delivery } from '../../../domain/entities/Delivery.entity';
import {
  ITransactionRepository,
  ICustomerRepository,
  IProductRepository,
  IDeliveryRepository,
} from '../../../domain';

describe('RecoverTransactionUseCase', () => {
  let useCase: RecoverTransactionUseCase;
  let transactionRepository: jest.Mocked<ITransactionRepository>;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let productRepository: jest.Mocked<IProductRepository>;
  let deliveryRepository: jest.Mocked<IDeliveryRepository>;

  const customer = new Customer({
    id: 'customer-1',
    email: 'test@test.com',
    fullName: 'Test User',
    phone: '3001234567',
  });

  const product = new Product({
    id: 'product-1',
    name: 'Test Product',
    price: 25000,
    stockQuantity: 10,
    isActive: true,
    imageUrl: 'https://example.com/image.jpg',
  });

  const pendingTransaction = new Transaction({
    id: 'transaction-1',
    transactionNo: 'TXN-001',
    productId: 'product-1',
    customerId: 'customer-1',
    amount: 25000,
    baseFee: 5000,
    deliveryFee: 10000,
    totalAmount: 40000,
    status: 'PENDING',
    createdAt: new Date('2026-01-31T12:00:00Z'),
  });

  const delivery = new Delivery({
    id: 'delivery-1',
    transactionId: 'transaction-1',
    fullName: 'Test User',
    phone: '3001234567',
    address: 'Calle 123 #45-67',
    city: 'Medellín',
    state: 'Antioquia',
    postalCode: '050001',
  });

  beforeEach(() => {
    transactionRepository = {
      findById: jest.fn(),
      findByTransactionNo: jest.fn(),
      findByCustomerId: jest.fn(),
      findPendingByCustomerId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      findAll: jest.fn(),
    } as jest.Mocked<ITransactionRepository>;

    customerRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ICustomerRepository>;

    productRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllAvailable: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStock: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<IProductRepository>;

    deliveryRepository = {
      findById: jest.fn(),
      findByTransactionId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<IDeliveryRepository>;

    useCase = new RecoverTransactionUseCase(
      transactionRepository,
      customerRepository,
      productRepository,
      deliveryRepository,
    );
  });

  describe('Validation', () => {
    it('should fail if customer not found by email', async () => {
      customerRepository.findByEmail.mockResolvedValue(null);

      const result = await useCase.execute({
        email: 'notfound@test.com',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('No pending transactions found for this email');
    });

    it('should fail if no pending transaction found', async () => {
      customerRepository.findByEmail.mockResolvedValue(customer);
      transactionRepository.findPendingByCustomerId.mockResolvedValue(null);

      const result = await useCase.execute({
        email: 'test@test.com',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('No pending transactions found for this email');
    });

    it('should fail if product not found', async () => {
      customerRepository.findByEmail.mockResolvedValue(customer);
      transactionRepository.findPendingByCustomerId.mockResolvedValue(
        pendingTransaction,
      );
      productRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({
        email: 'test@test.com',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Product not found');
    });

    it('should fail if delivery not found', async () => {
      customerRepository.findByEmail.mockResolvedValue(customer);
      transactionRepository.findPendingByCustomerId.mockResolvedValue(
        pendingTransaction,
      );
      productRepository.findById.mockResolvedValue(product);
      deliveryRepository.findByTransactionId.mockResolvedValue(null);

      const result = await useCase.execute({
        email: 'test@test.com',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Delivery not found');
    });
  });

  describe('Successful recovery', () => {
    it('should recover pending transaction', async () => {
      customerRepository.findByEmail.mockResolvedValue(customer);
      transactionRepository.findPendingByCustomerId.mockResolvedValue(
        pendingTransaction,
      );
      productRepository.findById.mockResolvedValue(product);
      deliveryRepository.findByTransactionId.mockResolvedValue(delivery);

      const result = await useCase.execute({
        email: 'test@test.com',
      });

      expect(result.isSuccess).toBe(true);

      if (result.isSuccess) {
        expect(result.value.transaction.id).toBe('transaction-1');
        expect(result.value.transaction.transactionNo).toBe('TXN-001');
        expect(result.value.transaction.status).toBe('PENDING');
        expect(result.value.transaction.totalAmount).toBe(40000);

        expect(result.value.product.name).toBe('Test Product');
        expect(result.value.product.price).toBe(25000);

        expect(result.value.delivery.city).toBe('Medellín');
        expect(result.value.delivery.state).toBe('Antioquia');
        expect(result.value.delivery.address).toBe('Calle 123 #45-67');
      }
    });

    it('should handle product without image', async () => {
      const productNoImage = new Product({
        id: 'product-2',
        name: 'Simple Product',
        price: 10000,
        stockQuantity: 5,
        isActive: true,
      });

      customerRepository.findByEmail.mockResolvedValue(customer);
      transactionRepository.findPendingByCustomerId.mockResolvedValue(
        pendingTransaction,
      );
      productRepository.findById.mockResolvedValue(productNoImage);
      deliveryRepository.findByTransactionId.mockResolvedValue(delivery);

      const result = await useCase.execute({
        email: 'test@test.com',
      });

      expect(result.isSuccess).toBe(true);

      if (result.isSuccess) {
        expect(result.value.product.imageUrl).toBeUndefined();
      }
    });
  });

  describe('Repository interactions', () => {
    it('should call findPendingByCustomerId with correct customerId', async () => {
      customerRepository.findByEmail.mockResolvedValue(customer);
      transactionRepository.findPendingByCustomerId.mockResolvedValue(
        pendingTransaction,
      );
      productRepository.findById.mockResolvedValue(product);
      deliveryRepository.findByTransactionId.mockResolvedValue(delivery);

      await useCase.execute({
        email: 'test@test.com',
      });

      const findPendingCalls =
        transactionRepository.findPendingByCustomerId.mock.calls.length;
      expect(findPendingCalls).toBe(1);

      const customerId =
        transactionRepository.findPendingByCustomerId.mock.calls[0][0];
      expect(customerId).toBe('customer-1');
    });

    it('should call findByEmail before searching transactions', async () => {
      customerRepository.findByEmail.mockResolvedValue(customer);
      transactionRepository.findPendingByCustomerId.mockResolvedValue(
        pendingTransaction,
      );
      productRepository.findById.mockResolvedValue(product);
      deliveryRepository.findByTransactionId.mockResolvedValue(delivery);

      await useCase.execute({
        email: 'test@test.com',
      });

      const emailCalls = customerRepository.findByEmail.mock.calls.length;
      expect(emailCalls).toBe(1);

      const email = customerRepository.findByEmail.mock.calls[0][0];
      expect(email).toBe('test@test.com');
    });
  });
});
