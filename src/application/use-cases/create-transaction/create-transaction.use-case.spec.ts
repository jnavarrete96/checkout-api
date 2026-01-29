import { CreateTransactionUseCase } from './create-transaction.use-case';
import { Customer } from '../../../domain/entities/Customer.entity';
import { Product } from '../../../domain/entities/Product.entity';
import {
  ICustomerRepository,
  IProductRepository,
  ITransactionRepository,
} from '../../../domain';
import { Transaction } from '../../../domain/entities/Transaction.entity';

const customer = new Customer({
  id: 'customer-1',
  email: 'test@test.com',
  fullName: 'Test User',
  phone: '3000000000',
});

const productWithoutStock = new Product({
  id: 'product-1',
  name: 'Test Product',
  price: 1000,
  stockQuantity: 0,
  isActive: true,
});

const productWithStock = new Product({
  id: 'product-1',
  name: 'Test Product',
  price: 1000,
  stockQuantity: 10,
  isActive: true,
});


describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;

  let customerRepository: jest.Mocked<ICustomerRepository>;
  let productRepository: jest.Mocked<IProductRepository>;
  let transactionRepository: jest.Mocked<ITransactionRepository>;

  beforeEach(() => {
    customerRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    productRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllAvailable: jest.fn(),
      update: jest.fn(),
      updateStock: jest.fn(),
    };

    transactionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByTransactionNo: jest.fn(),
      findByCustomerId: jest.fn(),
      findPendingByCustomerId: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      findAll: jest.fn(),
    };

    useCase = new CreateTransactionUseCase(
      customerRepository,
      productRepository,
      transactionRepository,
    );
  });

  it('should fail if customer does not exist', async () => {
    customerRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      customerId: 'customer-1',
      productId: 'product-1',
      quantity: 1,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Customer not found');
  });

  it('should fail if product does not exist', async () => {
    customerRepository.findById.mockResolvedValue(customer);

    productRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      customerId: 'customer-1',
      productId: 'product-1',
      quantity: 1,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Product not found');
  });

  it('should fail if stock is insufficient', async () => {
    customerRepository.findById.mockResolvedValue(customer);

    productRepository.findById.mockResolvedValue(productWithoutStock);

    const result = await useCase.execute({
      customerId: 'customer-1',
      productId: 'product-1',
      quantity: 2,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Insufficient stock');
  });

  it('should create transaction successfully', async () => {
    customerRepository.findById.mockResolvedValue(customer);

    productRepository.findById.mockResolvedValue(productWithStock);

    transactionRepository.create.mockImplementation(
      (transaction: Transaction) => Promise.resolve(transaction),
    );

    const result = await useCase.execute({
      customerId: 'customer-1',
      productId: 'product-1',
      quantity: 2,
    });

    expect(result.isSuccess).toBe(true);

    if (result.isSuccess) {
      expect(result.value.totalAmount).toBeGreaterThan(0);
      expect(result.value.status).toBe('PENDING');
      expect(transactionRepository.create).toHaveBeenCalledTimes(1);
    }
  });
});
