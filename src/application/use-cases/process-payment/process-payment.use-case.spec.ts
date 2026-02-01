/**
 * Process Payment Use Case Test
 */

import { ProcessPaymentUseCase } from './process-payment.use-case';
import { Transaction } from '../../../domain/entities/Transaction.entity';
import { Customer } from '../../../domain/entities/Customer.entity';
import { Product } from '../../../domain/entities/Product.entity';
import {
  ITransactionRepository,
  IProductRepository,
  ICustomerRepository,
} from '../../../domain';
import { WompiService } from '../../../infrastructure/external/wompi/wompi.service';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let transactionRepository: jest.Mocked<ITransactionRepository>;
  let productRepository: jest.Mocked<IProductRepository>;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let wompiService: jest.Mocked<WompiService>;

  const customer = new Customer({
    id: 'customer-1',
    email: 'test@test.com',
    fullName: 'Test User',
  });

  const product = new Product({
    id: 'product-1',
    name: 'Test Product',
    price: 100000,
    stockQuantity: 10,
    isActive: true,
  });

  const pendingTransaction = new Transaction({
    id: 'transaction-1',
    transactionNo: 'TXN-001',
    productId: 'product-1',
    customerId: 'customer-1',
    amount: 100000,
    baseFee: 5000,
    deliveryFee: 10000,
    totalAmount: 115000,
    status: 'PENDING',
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

    productRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllAvailable: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStock: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<IProductRepository>;

    customerRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ICustomerRepository>;

    wompiService = {
      tokenizeCard: jest.fn(),
      createTransaction: jest.fn(),
      getTransactionStatus: jest.fn(),
      pollTransactionStatus: jest.fn(),
    } as unknown as jest.Mocked<WompiService>;

    useCase = new ProcessPaymentUseCase(
      transactionRepository,
      productRepository,
      customerRepository,
      wompiService,
    );
  });

  const validInput = {
    transactionId: 'transaction-1',
    cardNumber: '4242424242424242',
    cardExpMonth: '12',
    cardExpYear: '28',
    cardCvc: '123',
    cardHolder: 'Test User',
  };

  describe('Validation', () => {
    it('should fail if transaction not found', async () => {
      transactionRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Transaction not found');
    });

    it('should fail if transaction cannot be processed', async () => {
      const approvedTransaction = new Transaction({
        ...pendingTransaction.toObject(),
        status: 'APPROVED',
      });

      transactionRepository.findById.mockResolvedValue(approvedTransaction);

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('cannot be processed');
    });

    it('should fail if customer not found', async () => {
      transactionRepository.findById.mockResolvedValue(
        new Transaction(pendingTransaction.toObject()),
      );

      customerRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Customer not found');
    });

    it('should fail if card tokenization fails', async () => {
      transactionRepository.findById.mockResolvedValue(
        new Transaction(pendingTransaction.toObject()),
      );
      customerRepository.findById.mockResolvedValue(customer);
      wompiService.tokenizeCard.mockResolvedValue({
        success: false,
        error: 'Invalid card number',
      });

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Invalid card number');
    });
  });

  describe('Successful payment (APPROVED)', () => {
    it('should process payment successfully', async () => {
      transactionRepository.findById.mockResolvedValue(
        new Transaction(pendingTransaction.toObject()),
      );
      customerRepository.findById.mockResolvedValue(customer);
      productRepository.findById.mockResolvedValue(product);

      wompiService.tokenizeCard.mockResolvedValue({
        success: true,
        token: 'tok_test_123',
        cardBrand: 'VISA',
        cardLastFour: '4242',
      });

      wompiService.createTransaction.mockResolvedValue({
        data: {
          id: 'wompi-tx-123',
          reference: 'TXN-001',
          status: 'APPROVED',
          amount_in_cents: 11500000,
          currency: 'COP',
          payment_method_type: 'CARD',
          payment_method: {
            type: 'CARD',
            extra: {
              brand: 'VISA',
              last_four: '4242',
              name: 'VISA-4242',
              card_type: 'CREDIT',
            },
            installments: 1,
          },
          created_at: new Date().toISOString(),
          status_message: null,
          merchant: {
            name: 'Test Merchant',
            legal_name: 'Test Merchant Legal',
            contact_name: 'Contact',
            phone_number: '1234567890',
            logo_url: null,
            legal_id_type: 'CC',
            email: 'merchant@test.com',
            legal_id: '123456',
          },
        },
      });

      transactionRepository.update.mockImplementation((t) =>
        Promise.resolve(t),
      );
      productRepository.update.mockImplementation((p) => Promise.resolve(p));

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);

      if (result.isSuccess) {
        expect(result.value.status).toBe('APPROVED');
        expect(result.value.wompiTransactionId).toBe('wompi-tx-123');
        expect(result.value.cardBrand).toBe('VISA');
        expect(result.value.cardLastFour).toBe('4242');

        // Verificar que se actualizó la transacción
        const updateCalls = transactionRepository.update.mock.calls.length;
        expect(updateCalls).toBe(1);

        // Verificar que se actualizó el stock
        const productUpdateCalls = productRepository.update.mock.calls.length;
        expect(productUpdateCalls).toBe(1);
      }
    });

    it('should handle PENDING status and poll until APPROVED', async () => {
      transactionRepository.findById.mockResolvedValue(
        new Transaction(pendingTransaction.toObject()),
      );
      customerRepository.findById.mockResolvedValue(customer);
      productRepository.findById.mockResolvedValue(product);

      wompiService.tokenizeCard.mockResolvedValue({
        success: true,
        token: 'tok_test_123',
        cardBrand: 'VISA',
        cardLastFour: '4242',
      });

      wompiService.createTransaction.mockResolvedValue({
        data: {
          id: 'wompi-tx-123',
          reference: 'TXN-001',
          status: 'PENDING', // ← Inicia PENDING
          amount_in_cents: 11500000,
          currency: 'COP',
          payment_method_type: 'CARD',
          payment_method: {
            type: 'CARD',
            extra: {
              brand: 'VISA',
              last_four: '4242',
              name: 'VISA-4242',
              card_type: 'CREDIT',
            },
            installments: 1,
          },
          created_at: new Date().toISOString(),
          status_message: null,
          merchant: {
            name: 'Test Merchant',
            legal_name: 'Test Merchant Legal',
            contact_name: 'Contact',
            phone_number: '1234567890',
            logo_url: null,
            legal_id_type: 'CC',
            email: 'merchant@test.com',
            legal_id: '123456',
          },
        },
      });

      wompiService.pollTransactionStatus.mockResolvedValue({
        data: {
          id: 'wompi-tx-123',
          status: 'APPROVED', // ← Termina APPROVED
          status_message: null,
          payment_method: {
            extra: {
              brand: 'VISA',
              last_four: '4242',
            },
          },
          reference: 'TXN-001',
        },
      });

      transactionRepository.update.mockImplementation((t) =>
        Promise.resolve(t),
      );
      productRepository.update.mockImplementation((p) => Promise.resolve(p));

      const result = await useCase.execute(validInput);
      expect(result.isSuccess).toBe(true);

      const pollCalls = wompiService.pollTransactionStatus.mock.calls.length;
      expect(pollCalls).toBe(1);

      const pollCallArg = wompiService.pollTransactionStatus.mock.calls[0][0];
      expect(pollCallArg).toBe('wompi-tx-123');
    });
  });

  describe('Failed payment (DECLINED)', () => {
    it('should handle declined payment', async () => {
      transactionRepository.findById.mockResolvedValue(
        new Transaction(pendingTransaction.toObject()),
      );
      customerRepository.findById.mockResolvedValue(customer);

      wompiService.tokenizeCard.mockResolvedValue({
        success: true,
        token: 'tok_test_123',
        cardBrand: 'VISA',
        cardLastFour: '1111',
      });

      wompiService.createTransaction.mockResolvedValue({
        data: {
          id: 'wompi-tx-declined',
          reference: 'TXN-001',
          status: 'DECLINED',
          amount_in_cents: 11500000,
          currency: 'COP',
          payment_method_type: 'CARD',
          payment_method: {
            type: 'CARD',
            extra: {
              brand: 'VISA',
              last_four: '1111',
              name: 'VISA-1111',
              card_type: 'CREDIT',
            },
            installments: 1,
          },
          created_at: new Date().toISOString(),
          status_message: 'Insufficient funds',
          merchant: {
            name: 'Test Merchant',
            legal_name: 'Test Merchant Legal',
            contact_name: 'Contact',
            phone_number: '1234567890',
            logo_url: null,
            legal_id_type: 'CC',
            email: 'merchant@test.com',
            legal_id: '123456',
          },
        },
      });

      transactionRepository.update.mockImplementation((t) =>
        Promise.resolve(t),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);

      if (result.isSuccess) {
        expect(result.value.status).toBe('DECLINED');
        expect(result.value.wompiTransactionId).toBe('wompi-tx-declined');
        expect(result.value.cardBrand).toBeUndefined(); // correcto según tu decline
        expect(result.value.cardLastFour).toBeUndefined();
        expect(result.value.message).toContain('declined');
      }

      // Se actualiza la transacción
      const updateSpy = jest.spyOn(transactionRepository, 'update');
      expect(updateSpy).toHaveBeenCalledTimes(1);

      // ❌ NO se toca el stock
      const productUpdateSpy = jest.spyOn(productRepository, 'update');
      expect(productUpdateSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('Payment error', () => {
    it('should handle payment error status', async () => {
      transactionRepository.findById.mockResolvedValue(
        new Transaction(pendingTransaction.toObject()),
      );
      customerRepository.findById.mockResolvedValue(customer);

      wompiService.tokenizeCard.mockResolvedValue({
        success: true,
        token: 'tok_test_123',
      });

      wompiService.createTransaction.mockResolvedValue({
        data: {
          id: 'wompi-tx-error',
          reference: 'TXN-001',
          status: 'ERROR',
          amount_in_cents: 11500000,
          currency: 'COP',
          payment_method_type: 'CARD',
          payment_method: {
            type: 'CARD',
            extra: {
              brand: '',
              last_four: '',
              name: '',
              card_type: 'CREDIT',
            },
            installments: 1,
          },
          created_at: new Date().toISOString(),
          status_message: 'Technical error',
          merchant: {
            name: 'Test Merchant',
            legal_name: 'Test Merchant Legal',
            contact_name: 'Contact',
            phone_number: '1234567890',
            logo_url: null,
            legal_id_type: 'CC',
            email: 'merchant@test.com',
            legal_id: '123456',
          },
        },
      });

      transactionRepository.update.mockImplementation((t) =>
        Promise.resolve(t),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('error');
    });
  });
});
