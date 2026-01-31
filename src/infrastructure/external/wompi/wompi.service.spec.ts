/**
 * Wompi Service Test
 * Tests de integración con Wompi API sandbox
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WompiService } from './wompi.service';
import wompiConfig from '../../config/wompi.config';

describe('WompiService', () => {
  let service: WompiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule.forRoot({
          load: [wompiConfig],
        }),
      ],
      providers: [WompiService],
    }).compile();

    service = module.get<WompiService>(WompiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('tokenizeCard', () => {
    it('should tokenize APPROVED card (4242...) successfully', async () => {
      const result = await service.tokenizeCard({
        number: '4242424242424242',
        expMonth: '12',
        expYear: '28',
        cvc: '123',
        cardHolder: 'Juan Perez',
      });

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.token).toMatch(/^tok_/);
      expect(result.cardBrand).toBe('VISA');
      expect(result.cardLastFour).toBe('4242');
      expect(result.error).toBeUndefined();
    }, 15000);

    it('should tokenize DECLINED card (4111...) successfully', async () => {
      // Nota: La tokenización siempre funciona
      // El rechazo ocurre en createTransaction()
      const result = await service.tokenizeCard({
        number: '4111111111111111',
        expMonth: '12',
        expYear: '28',
        cvc: '123',
        cardHolder: 'Maria Lopez',
      });

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.cardBrand).toBe('VISA');
      expect(result.cardLastFour).toBe('1111');
    }, 15000);

    it('should return error for invalid card number', async () => {
      const result = await service.tokenizeCard({
        number: '1234567890123456',
        expMonth: '12',
        expYear: '28',
        cvc: '123',
        cardHolder: 'Invalid Card',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.token).toBeUndefined();
    }, 15000);

    it('should return error for expired card', async () => {
      const result = await service.tokenizeCard({
        number: '4242424242424242',
        expMonth: '12',
        expYear: '20', // Año pasado
        cvc: '123',
        cardHolder: 'Expired Card',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    }, 15000);
  });

  describe('createTransaction', () => {
    it('should create transaction with APPROVED card', async () => {
      // Primero tokenizar
      const tokenResult = await service.tokenizeCard({
        number: '4242424242424242',
        expMonth: '12',
        expYear: '28',
        cvc: '123',
        cardHolder: 'Test User',
      });

      expect(tokenResult.success).toBe(true);

      // Crear transacción
      const txResponse = await service.createTransaction({
        amount_in_cents: 10000000, // 100,000 COP
        currency: 'COP',
        customer_email: 'test@test.com',
        reference: `TEST-${Date.now()}`,
        payment_method: {
          type: 'CARD',
          token: tokenResult.token!,
          installments: 1,
        },
      });

      expect(txResponse.data).toBeDefined();
      expect(txResponse.data.id).toBeDefined();
      expect(txResponse.data.reference).toMatch(/^TEST-/);
      expect(txResponse.data.status).toBeDefined();
      expect(['PENDING', 'APPROVED']).toContain(txResponse.data.status);
    }, 30000);

    it('should create transaction with DECLINED card', async () => {
      // Tokenizar tarjeta que será rechazada
      const tokenResult = await service.tokenizeCard({
        number: '4111111111111111',
        expMonth: '12',
        expYear: '28',
        cvc: '123',
        cardHolder: 'Test User',
      });

      expect(tokenResult.success).toBe(true);

      // Crear transacción
      const txResponse = await service.createTransaction({
        amount_in_cents: 10000000,
        currency: 'COP',
        customer_email: 'test@test.com',
        reference: `TEST-DECLINED-${Date.now()}`,
        payment_method: {
          type: 'CARD',
          token: tokenResult.token!,
          installments: 1,
        },
      });

      expect(txResponse.data).toBeDefined();
      expect(txResponse.data.status).toBeDefined();
      // Puede ser PENDING o DECLINED dependiendo de timing
      expect(['PENDING', 'DECLINED']).toContain(txResponse.data.status);
    }, 30000);
  });

  describe('getTransactionStatus', () => {
    it('should get status of existing transaction', async () => {
      // Crear transacción primero
      const tokenResult = await service.tokenizeCard({
        number: '4242424242424242',
        expMonth: '12',
        expYear: '28',
        cvc: '123',
        cardHolder: 'Test User',
      });

      const txResponse = await service.createTransaction({
        amount_in_cents: 5000000,
        currency: 'COP',
        customer_email: 'test@test.com',
        reference: `TEST-STATUS-${Date.now()}`,
        payment_method: {
          type: 'CARD',
          token: tokenResult.token!,
          installments: 1,
        },
      });

      const transactionId = txResponse.data.id;

      // Consultar estado
      const statusResponse = await service.getTransactionStatus(transactionId);

      expect(statusResponse.data).toBeDefined();
      expect(statusResponse.data.id).toBe(transactionId);
      expect(statusResponse.data.status).toBeDefined();
      expect(['PENDING', 'APPROVED', 'DECLINED']).toContain(
        statusResponse.data.status,
      );
    }, 30000);
  });

  describe('pollTransactionStatus', () => {
    it('should poll until transaction is APPROVED', async () => {
      // Crear transacción
      const tokenResult = await service.tokenizeCard({
        number: '4242424242424242',
        expMonth: '12',
        expYear: '28',
        cvc: '123',
        cardHolder: 'Test User',
      });

      const txResponse = await service.createTransaction({
        amount_in_cents: 5000000,
        currency: 'COP',
        customer_email: 'test@test.com',
        reference: `TEST-POLL-${Date.now()}`,
        payment_method: {
          type: 'CARD',
          token: tokenResult.token!,
          installments: 1,
        },
      });

      const transactionId = txResponse.data.id;

      // Hacer polling
      const finalStatus = await service.pollTransactionStatus(transactionId);

      expect(finalStatus.data).toBeDefined();
      expect(finalStatus.data.status).toBe('APPROVED');
      expect(finalStatus.data.id).toBe(transactionId);
    }, 60000);

    it('should poll until transaction is DECLINED', async () => {
      // Crear transacción con tarjeta que será rechazada
      const tokenResult = await service.tokenizeCard({
        number: '4111111111111111',
        expMonth: '12',
        expYear: '28',
        cvc: '123',
        cardHolder: 'Test User',
      });

      const txResponse = await service.createTransaction({
        amount_in_cents: 5000000,
        currency: 'COP',
        customer_email: 'test@test.com',
        reference: `TEST-POLL-DECLINED-${Date.now()}`,
        payment_method: {
          type: 'CARD',
          token: tokenResult.token!,
          installments: 1,
        },
      });

      const transactionId = txResponse.data.id;

      // Hacer polling
      const finalStatus = await service.pollTransactionStatus(transactionId);

      expect(finalStatus.data).toBeDefined();
      expect(finalStatus.data.status).toBe('DECLINED');
      expect(finalStatus.data.id).toBe(transactionId);
    }, 60000);
  });

  describe('Full payment flow', () => {
    it('should complete full payment flow: tokenize -> create -> poll', async () => {
      // 1. Tokenizar tarjeta
      const tokenResult = await service.tokenizeCard({
        number: '4242424242424242',
        expMonth: '12',
        expYear: '28',
        cvc: '123',
        cardHolder: 'Full Flow Test',
      });

      expect(tokenResult.success).toBe(true);
      expect(tokenResult.token).toBeDefined();

      // 2. Crear transacción
      const txResponse = await service.createTransaction({
        amount_in_cents: 25000000, // 250,000 COP
        currency: 'COP',
        customer_email: 'fullflow@test.com',
        reference: `TEST-FULLFLOW-${Date.now()}`,
        payment_method: {
          type: 'CARD',
          token: tokenResult.token!,
          installments: 1,
        },
      });

      expect(txResponse.data.id).toBeDefined();
      const transactionId = txResponse.data.id;

      // 3. Polling hasta estado final
      const finalStatus = await service.pollTransactionStatus(transactionId);

      expect(finalStatus.data.status).toBe('APPROVED');
      expect(finalStatus.data.payment_method.extra.brand).toBe('VISA');
      expect(finalStatus.data.payment_method.extra.last_four).toBe('4242');
    }, 60000);
  });
});
