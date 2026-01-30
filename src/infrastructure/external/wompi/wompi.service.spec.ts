/**
 * Wompi Service Test - tokenizeCard()

 * Test para verificar que la tokenización funciona correctamente
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WompiService } from './wompi.service';
import wompiConfig from '../../config/wompi.config';

describe('WompiService - tokenizeCard', () => {
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

  describe('tokenizeCard - APPROVED card (4242...)', () => {
    it('should tokenize card successfully', async () => {
      const result = await service.tokenizeCard({
        number: '4242424242424242',
        expMonth: '12',
        expYear: '28',
        cvc: '123',
        cardHolder: 'Juan Perez',
      });

      console.log('Result:', JSON.stringify(result, null, 2));

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.token).toMatch(/^tok_/); // Token empieza con "tok_"
      expect(result.cardBrand).toBe('VISA');
      expect(result.cardLastFour).toBe('4242');
      expect(result.error).toBeUndefined();
    });
  });

  describe('tokenizeCard - DECLINED card (4111...)', () => {
    it('should tokenize card successfully (tokenization always works, rejection happens in transaction)', async () => {
      const result = await service.tokenizeCard({
        number: '4111111111111111',
        expMonth: '12',
        expYear: '28',
        cvc: '123',
        cardHolder: 'Maria Lopez',
      });

      console.log('Result:', JSON.stringify(result, null, 2));

      // La tokenización SIEMPRE funciona
      // El rechazo ocurre en POST /transactions, no aquí
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.cardBrand).toBe('VISA');
      expect(result.cardLastFour).toBe('1111');
    });
  });

  describe('tokenizeCard - Invalid card', () => {
    it('should return error for invalid card number', async () => {
      const result = await service.tokenizeCard({
        number: '1234567890123456', // Número inválido
        expMonth: '12',
        expYear: '28',
        cvc: '123',
        cardHolder: 'Invalid Card',
      });

      console.log('Result:', JSON.stringify(result, null, 2));

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.token).toBeUndefined();
    });
  });

  describe('tokenizeCard - Expired card', () => {
    it('should return error for expired card', async () => {
      const result = await service.tokenizeCard({
        number: '4242424242424242',
        expMonth: '12',
        expYear: '20', // Año pasado
        cvc: '123',
        cardHolder: 'Expired Card',
      });

      console.log('Result:', JSON.stringify(result, null, 2));

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
