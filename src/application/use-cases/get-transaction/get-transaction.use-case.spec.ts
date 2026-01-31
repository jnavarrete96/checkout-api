/**
 * Get Transaction Use Case Test
 */

import { GetTransactionUseCase } from './get-transaction.use-case';
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

describe('GetTransactionUseCase', () => {
  let useCase: GetTransactionUseCase;
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
    description: 'Test Description',
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
  });

  const approvedTransaction = new Transaction({
    id: 'transaction-2',
    transactionNo: 'TXN-002',
    productId: 'product-1',
    customerId: 'customer-1',
    amount: 25000,
    baseFee: 5000,
    deliveryFee: 10000,
    totalAmount: 40000,
    status: 'APPROVED',
    wompiTransactionId: 'wompi-123',
    wompiReference: 'TXN-002',
    cardBrand: 'VISA',
    cardLastFour: '4242',
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

    useCase = new GetTransactionUseCase(
      transactionRepository,
      customerRepository,
      productRepository,
      deliveryRepository,
    );
  });

  describe('Validation', () => {
    it('should fail if transaction not found', async () => {
      transactionRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({
        transactionId: 'non-existent',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Transaction not found');
    });

    it('should fail if customer not found', async () => {
      transactionRepository.findById.mockResolvedValue(pendingTransaction);
      customerRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({
        transactionId: 'transaction-1',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Customer not found');
    });

    it('should fail if product not found', async () => {
      transactionRepository.findById.mockResolvedValue(pendingTransaction);
      customerRepository.findById.mockResolvedValue(customer);
      productRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({
        transactionId: 'transaction-1',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Product not found');
    });

    it('should fail if delivery not found', async () => {
      transactionRepository.findById.mockResolvedValue(pendingTransaction);
      customerRepository.findById.mockResolvedValue(customer);
      productRepository.findById.mockResolvedValue(product);
      deliveryRepository.findByTransactionId.mockResolvedValue(null);

      const result = await useCase.execute({
        transactionId: 'transaction-1',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Delivery not found');
    });
  });

  describe('Successful retrieval', () => {
    it('should get PENDING transaction without payment info', async () => {
      transactionRepository.findById.mockResolvedValue(pendingTransaction);
      customerRepository.findById.mockResolvedValue(customer);
      productRepository.findById.mockResolvedValue(product);
      deliveryRepository.findByTransactionId.mockResolvedValue(delivery);

      const result = await useCase.execute({
        transactionId: 'transaction-1',
      });

      expect(result.isSuccess).toBe(true);

      if (result.isSuccess) {
        const {
          transaction,
          customer: cust,
          product: prod,
          delivery: del,
          payment,
        } = result.value;

        // Verificar transaction
        expect(transaction.id).toBe('transaction-1');
        expect(transaction.transactionNo).toBe('TXN-001');
        expect(transaction.status).toBe('PENDING');
        expect(transaction.totalAmount).toBe(40000);

        // Verificar customer
        expect(cust.email).toBe('test@test.com');
        expect(cust.fullName).toBe('Test User');
        expect(cust.phone).toBe('3001234567');

        // Verificar product
        expect(prod.id).toBe('product-1');
        expect(prod.name).toBe('Test Product');
        expect(prod.price).toBe(25000);

        // Verificar delivery
        expect(del.fullName).toBe('Test User');
        expect(del.address).toBe('Calle 123 #45-67');
        expect(del.city).toBe('Medellín');

        // Payment no debe existir (transacción PENDING)
        expect(payment).toBeUndefined();
      }
    });

    it('should get APPROVED transaction with payment info', async () => {
      transactionRepository.findById.mockResolvedValue(approvedTransaction);
      customerRepository.findById.mockResolvedValue(customer);
      productRepository.findById.mockResolvedValue(product);
      deliveryRepository.findByTransactionId.mockResolvedValue(delivery);

      const result = await useCase.execute({
        transactionId: 'transaction-2',
      });

      expect(result.isSuccess).toBe(true);

      if (result.isSuccess) {
        const { transaction, payment } = result.value;

        // Verificar transaction
        expect(transaction.status).toBe('APPROVED');

        // Verificar payment
        expect(payment).toBeDefined();
        expect(payment?.cardBrand).toBe('VISA');
        expect(payment?.cardLastFour).toBe('4242');
        expect(payment?.wompiTransactionId).toBe('wompi-123');
        expect(payment?.wompiReference).toBe('TXN-002');
      }
    });

    it('should handle optional fields correctly', async () => {
      const customerNoPhone = new Customer({
        id: 'customer-2',
        email: 'nophone@test.com',
        fullName: 'No Phone User',
      });

      const productNoDescription = new Product({
        id: 'product-2',
        name: 'Simple Product',
        price: 10000,
        stockQuantity: 5,
        isActive: true,
      });

      const deliveryNoPostal = new Delivery({
        id: 'delivery-2',
        transactionId: 'transaction-1',
        fullName: 'Test User',
        phone: '3001234567',
        address: 'Calle 123 #45-67',
        city: 'Bogotá',
        state: 'Cundinamarca',
      });

      transactionRepository.findById.mockResolvedValue(pendingTransaction);
      customerRepository.findById.mockResolvedValue(customerNoPhone);
      productRepository.findById.mockResolvedValue(productNoDescription);
      deliveryRepository.findByTransactionId.mockResolvedValue(
        deliveryNoPostal,
      );

      const result = await useCase.execute({
        transactionId: 'transaction-1',
      });

      expect(result.isSuccess).toBe(true);

      if (result.isSuccess) {
        const { customer: cust, product: prod, delivery: del } = result.value;

        // Campos opcionales deben ser undefined
        expect(cust.phone).toBeUndefined();
        expect(prod.description).toBeUndefined();
        expect(prod.imageUrl).toBeUndefined();
        expect(del.postalCode).toBeUndefined();
      }
    });
  });
});
