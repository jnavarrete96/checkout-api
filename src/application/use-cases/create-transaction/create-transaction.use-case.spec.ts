import { CreateTransactionUseCase } from './create-transaction.use-case';
import { Customer } from '../../../domain/entities/Customer.entity';
import { Product } from '../../../domain/entities/Product.entity';
import {
  ICustomerRepository,
  IProductRepository,
  ITransactionRepository,
  IDeliveryRepository,
} from '../../../domain';

const productWithoutStock = new Product({
  id: 'product-1',
  name: 'Test Product',
  price: 100000,
  stockQuantity: 0,
  isActive: true,
});

const productWithStock = new Product({
  id: 'product-1',
  name: 'Test Product',
  price: 100000,
  stockQuantity: 10,
  isActive: true,
});

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let productRepository: jest.Mocked<IProductRepository>;
  let transactionRepository: jest.Mocked<ITransactionRepository>;
  let deliveryRepository: jest.Mocked<IDeliveryRepository>;

  beforeEach(() => {
    process.env.BASE_FEE = '5000';
    process.env.DELIVERY_FEE = '10000';
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

    transactionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByTransactionNo: jest.fn(),
      findByCustomerId: jest.fn(),
      findPendingByCustomerId: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      findAll: jest.fn(),
    } as jest.Mocked<ITransactionRepository>;

    deliveryRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByTransactionId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<IDeliveryRepository>;

    useCase = new CreateTransactionUseCase(
      customerRepository,
      productRepository,
      transactionRepository,
      deliveryRepository,
    );
  });

  describe('Product validation', () => {
    it('should fail if product does not exist', async () => {
      const existingCustomer = new Customer({
        id: 'customer-1',
        email: 'existing@test.com',
        fullName: 'Existing User',
        phone: '3000000000',
      });
      customerRepository.findByEmail.mockResolvedValue(existingCustomer);
      productRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({
        customerEmail: 'test@test.com',
        customerFullName: 'Test User',
        customerPhone: '3001234567',
        productId: 'product-1',
        quantity: 1,
        deliveryFullName: 'Juan Perez',
        deliveryPhone: '3001234567',
        deliveryAddress: 'Calle 123 #45-67',
        deliveryCity: 'Medellín',
        deliveryState: 'Antioquia',
        deliveryPostalCode: '050001',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Product not found');
    });

    it('should fail if product is not available', async () => {
      const existingCustomer = new Customer({
        id: 'customer-1',
        email: 'existing@test.com',
        fullName: 'Existing User',
        phone: '3000000000',
      });
      customerRepository.findByEmail.mockResolvedValue(existingCustomer);

      const inactiveProduct = new Product({
        id: 'product-1',
        name: 'Test Product',
        price: 100000,
        stockQuantity: 10,
        isActive: false,
      });

      productRepository.findById.mockResolvedValue(inactiveProduct);

      const result = await useCase.execute({
        customerEmail: 'test@test.com',
        customerFullName: 'Test User',
        customerPhone: '3001234567',
        productId: 'product-1',
        quantity: 1,
        deliveryFullName: 'Juan Perez',
        deliveryPhone: '3001234567',
        deliveryAddress: 'Calle 123 #45-67',
        deliveryCity: 'Medellín',
        deliveryState: 'Antioquia',
        deliveryPostalCode: '050001',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Product not available');
    });

    it('should fail if stock is insufficient', async () => {
      const existingCustomer = new Customer({
        id: 'customer-1',
        email: 'existing@test.com',
        fullName: 'Existing User',
        phone: '3000000000',
      });
      customerRepository.findByEmail.mockResolvedValue(existingCustomer);
      productRepository.findById.mockResolvedValue(productWithoutStock);

      const result = await useCase.execute({
        customerEmail: 'test@test.com',
        customerFullName: 'Test User',
        customerPhone: '3001234567',
        productId: 'product-1',
        quantity: 2,
        deliveryFullName: 'Juan Perez',
        deliveryPhone: '3001234567',
        deliveryAddress: 'Calle 123 #45-67',
        deliveryCity: 'Medellín',
        deliveryState: 'Antioquia',
        deliveryPostalCode: '050001',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Insufficient stock');
    });
  });

  describe('Customer creation/update', () => {
    it('should create new customer if email does not exist', async () => {
      customerRepository.findByEmail.mockResolvedValue(null);
      customerRepository.create.mockImplementation((c) => Promise.resolve(c));
      productRepository.findById.mockResolvedValue(productWithStock);
      transactionRepository.create.mockImplementation((t) =>
        Promise.resolve(t),
      );
      deliveryRepository.create.mockImplementation((d) => Promise.resolve(d));

      const result = await useCase.execute({
        customerEmail: 'newuser@test.com',
        customerFullName: 'New User',
        customerPhone: '3009876543',
        productId: 'product-1',
        quantity: 1,
        deliveryFullName: 'New User',
        deliveryPhone: '3009876543',
        deliveryAddress: 'Calle 456 #12-34',
        deliveryCity: 'Bogotá',
        deliveryState: 'Cundinamarca',
      });

      expect(result.isSuccess).toBe(true);

      // Verificar que se creó el customer
      const createCalls = customerRepository.create.mock.calls.length;
      expect(createCalls).toBe(1);

      const createdCustomer = customerRepository.create.mock.calls[0][0];
      expect(createdCustomer.email).toBe('newuser@test.com');
      expect(createdCustomer.fullName).toBe('New User');
      expect(createdCustomer.phone).toBe('3009876543');
    });

    it('should reuse existing customer if email exists and data unchanged', async () => {
      const existingCustomer = new Customer({
        id: 'customer-1',
        email: 'existing@test.com',
        fullName: 'Existing User',
        phone: '3000000000',
      });
      customerRepository.findByEmail.mockResolvedValue(existingCustomer);
      productRepository.findById.mockResolvedValue(productWithStock);
      transactionRepository.create.mockImplementation((t) =>
        Promise.resolve(t),
      );
      deliveryRepository.create.mockImplementation((d) => Promise.resolve(d));

      const result = await useCase.execute({
        customerEmail: 'existing@test.com',
        customerFullName: 'Existing User',
        customerPhone: '3000000000',
        productId: 'product-1',
        quantity: 1,
        deliveryFullName: 'Existing User',
        deliveryPhone: '3000000000',
        deliveryAddress: 'Calle 789 #12-34',
        deliveryCity: 'Cali',
        deliveryState: 'Valle del Cauca',
      });

      expect(result.isSuccess).toBe(true);

      // Verificar que NO se creó customer nuevo
      const createCalls = customerRepository.create.mock.calls.length;
      expect(createCalls).toBe(0);

      // Verificar que NO se actualizó (datos iguales)
      const updateCalls = customerRepository.update.mock.calls.length;
      expect(updateCalls).toBe(0);
    });

    it('should update existing customer if data changed', async () => {
      const existingCustomer = new Customer({
        id: 'customer-1',
        email: 'existing@test.com',
        fullName: 'Existing User',
        phone: '3000000000',
      });
      customerRepository.findByEmail.mockResolvedValue(existingCustomer);
      customerRepository.update.mockImplementation((c) => Promise.resolve(c));
      productRepository.findById.mockResolvedValue(productWithStock);
      transactionRepository.create.mockImplementation((t) =>
        Promise.resolve(t),
      );
      deliveryRepository.create.mockImplementation((d) => Promise.resolve(d));

      const result = await useCase.execute({
        customerEmail: 'existing@test.com',
        customerFullName: 'Updated Name',
        customerPhone: '3002222222',
        productId: 'product-1',
        quantity: 1,
        deliveryFullName: 'Updated Name',
        deliveryPhone: '3002222222',
        deliveryAddress: 'Calle 789 #12-34',
        deliveryCity: 'Cali',
        deliveryState: 'Valle del Cauca',
      });

      expect(result.isSuccess).toBe(true);

      // Verificar que se actualizó
      const updateCalls = customerRepository.update.mock.calls.length;
      expect(updateCalls).toBe(1);
    });
  });

  describe('Transaction creation', () => {
    it('should create transaction and delivery successfully', async () => {
      const existingCustomer = new Customer({
        id: 'customer-1',
        email: 'existing@test.com',
        fullName: 'Existing User',
        phone: '3000000000',
      });
      customerRepository.findByEmail.mockResolvedValue(existingCustomer);
      productRepository.findById.mockResolvedValue(productWithStock);
      transactionRepository.create.mockImplementation((t) =>
        Promise.resolve(t),
      );
      deliveryRepository.create.mockImplementation((d) => Promise.resolve(d));

      const result = await useCase.execute({
        customerEmail: 'test@test.com',
        customerFullName: 'Test User',
        customerPhone: '3001234567',
        productId: 'product-1',
        quantity: 2,
        deliveryFullName: 'Juan Perez',
        deliveryPhone: '3001234567',
        deliveryAddress: 'Calle 123 #45-67',
        deliveryCity: 'Medellín',
        deliveryState: 'Antioquia',
        deliveryPostalCode: '050001',
      });

      expect(result.isSuccess).toBe(true);

      if (result.isSuccess) {
        expect(result.value.totalAmount).toBeGreaterThan(0);
        expect(result.value.status).toBe('PENDING');
        expect(result.value.transactionId).toBeDefined();
        expect(result.value.transactionNo).toMatch(/^TXN-\d{8}-\d+$/);

        // Verificar que se llamaron los métodos correctos
        const transactionCreateCalls =
          transactionRepository.create.mock.calls.length;
        const deliveryCreateCalls = deliveryRepository.create.mock.calls.length;
        expect(transactionCreateCalls).toBe(1);
        expect(deliveryCreateCalls).toBe(1);

        // Verificar que se creó el delivery con los datos correctos
        const deliveryCall = deliveryRepository.create.mock.calls[0][0];
        expect(deliveryCall.fullName).toBe('Juan Perez');
        expect(deliveryCall.phone).toBe('3001234567');
        expect(deliveryCall.address).toBe('Calle 123 #45-67');
        expect(deliveryCall.city).toBe('Medellín');
        expect(deliveryCall.state).toBe('Antioquia');
      }
    });

    it('should calculate total amount correctly', async () => {
      const existingCustomer = new Customer({
        id: 'customer-1',
        email: 'existing@test.com',
        fullName: 'Existing User',
        phone: '3000000000',
      });
      customerRepository.findByEmail.mockResolvedValue(existingCustomer);
      productRepository.findById.mockResolvedValue(productWithStock);
      transactionRepository.create.mockImplementation((t) =>
        Promise.resolve(t),
      );
      deliveryRepository.create.mockImplementation((d) => Promise.resolve(d));

      const result = await useCase.execute({
        customerEmail: 'test@test.com',
        customerFullName: 'Test User',
        customerPhone: '3001234567',
        productId: 'product-1',
        quantity: 2,
        deliveryFullName: 'Juan Perez',
        deliveryPhone: '3001234567',
        deliveryAddress: 'Calle 123 #45-67',
        deliveryCity: 'Medellín',
        deliveryState: 'Antioquia',
      });

      expect(result.isSuccess).toBe(true);

      if (result.isSuccess) {
        // product.price = 100000
        // quantity = 2
        // amount = 100000 * 2 = 200000
        // baseFee = 5000 (default en .env)
        // deliveryFee = 10000 (default en .env)
        // total = 200000 + 5000 + 10000 = 215000
        expect(result.value.totalAmount).toBe(215000);
      }
    });
  });
});
