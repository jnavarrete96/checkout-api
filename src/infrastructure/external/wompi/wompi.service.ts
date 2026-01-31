/**
 * Wompi Service - Infrastructure Layer

 * Implementación de IPaymentGateway para integración con Wompi API.
 * 
 * Por ahora solo implementamos tokenizeCard() para probar la integración.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import {
  WompiTokenizeCardRequest,
  WompiTokenizeCardResponse,
  WompiErrorResponse,
  WompiTransactionResponse,
  WompiCreateTransactionRequest,
  WompiTransactionStatusResponse,
  WompiMerchantResponse,
} from './wompi.types';

@Injectable()
export class WompiService {
  private readonly logger = new Logger(WompiService.name);
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly requestTimeout: number;
  private readonly pollingInterval: number;
  private acceptanceToken?: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'wompi.baseUrl',
      'https://api-sandbox.co.uat.wompi.dev/v1',
    );
    this.publicKey = this.configService.get<string>('wompi.publicKey', '');
    this.requestTimeout = this.configService.get<number>(
      'wompi.requestTimeout',
      30000,
    );

    this.logger.log(`Wompi Service initialized`);
    this.logger.log(`Base URL: ${this.baseUrl}`);
    this.logger.log(`Public Key: ${this.publicKey.substring(0, 20)}...`);
  }

  /**
   * Tokenizar tarjeta de crédito
 
   * Convierte datos sensibles de tarjeta en un token seguro.
   * Este token se usará posteriormente para crear la transacción.
   * 
   * @param cardData Datos de la tarjeta
   * @returns Token, marca y últimos 4 dígitos
   */
  async tokenizeCard(cardData: {
    number: string;
    expMonth: string;
    expYear: string;
    cvc: string;
    cardHolder: string;
  }): Promise<{
    success: boolean;
    token?: string;
    cardBrand?: string;
    cardLastFour?: string;
    error?: string;
  }> {
    try {
      this.logger.log('Tokenizing card...');

      // Preparar request según formato de Wompi
      const requestBody: WompiTokenizeCardRequest = {
        number: cardData.number.replace(/\s/g, ''), // Remover espacios
        exp_month: cardData.expMonth.padStart(2, '0'), // Asegurar 2 dígitos
        exp_year: cardData.expYear,
        cvc: cardData.cvc,
        card_holder: cardData.cardHolder,
      };

      this.logger.debug(
        `Request body: ${JSON.stringify({
          ...requestBody,
          number: `****${requestBody.number.slice(-4)}`, // Ocultar número en logs
          cvc: '***', // Ocultar CVC en logs
        })}`,
      );

      // Llamar a Wompi API
      const response = await firstValueFrom(
        this.httpService.post<WompiTokenizeCardResponse>(
          `${this.baseUrl}/tokens/cards`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${this.publicKey}`,
              'Content-Type': 'application/json',
            },
            timeout: this.requestTimeout,
          },
        ),
      );

      this.logger.log('Card tokenized successfully');
      this.logger.debug(`Response: ${JSON.stringify(response.data)}`);

      // Extraer datos importantes
      const { id, brand, last_four } = response.data.data;

      return {
        success: true,
        token: id,
        cardBrand: brand,
        cardLastFour: last_four,
      };
    } catch (error) {
      this.logger.error('Error tokenizing card', error);

      if (error instanceof AxiosError) {
        const wompiError = error.response?.data as WompiErrorResponse;

        if (wompiError?.error) {
          const errorMessages = Object.values(wompiError.error.messages).flat();
          const errorMessage = errorMessages.join(', ');

          this.logger.error(`Wompi API error: ${errorMessage}`);

          return {
            success: false,
            error: errorMessage,
          };
        }

        return {
          success: false,
          error: error.message || 'Error connecting to payment gateway',
        };
      }

      return {
        success: false,
        error: 'Unexpected error tokenizing card',
      };
    }
  }

  // ============================================================
  // 1.1 Obtener acceptance token (cacheado)
  // ============================================================

  private async getAcceptanceToken(): Promise<string> {
    if (this.acceptanceToken) {
      return this.acceptanceToken;
    }

    this.logger.log('Fetching acceptance token from Wompi...');

    const response = await firstValueFrom(
      this.httpService.get<WompiMerchantResponse>(
        `${this.baseUrl}/merchants/${this.publicKey}`,
        {
          timeout: this.requestTimeout,
        },
      ),
    );

    const acceptanceToken =
      response.data.data.presigned_acceptance.acceptance_token;

    if (!acceptanceToken) {
      throw new Error('Acceptance token not found in Wompi response');
    }

    this.acceptanceToken = acceptanceToken;

    return acceptanceToken;
  }

  // ============================================================
  // 2. Crear transacción
  // ============================================================

  async createTransaction(
    request: WompiCreateTransactionRequest,
  ): Promise<WompiTransactionResponse> {
    try {
      this.logger.log('Creating transaction...');
      const acceptanceToken = await this.getAcceptanceToken();
      const response = await firstValueFrom(
        this.httpService.post<WompiTransactionResponse>(
          `${this.baseUrl}/transactions`,
          {
            ...request,
            acceptance_token: acceptanceToken,
          },
          {
            headers: {
              Authorization: `Bearer ${this.publicKey}`,
              'Content-Type': 'application/json',
            },
            timeout: this.requestTimeout,
          },
        ),
      );
      this.logger.log('Transaction created successfully');
      return response.data;
    } catch (error) {
      this.acceptanceToken = undefined;
      this.handleError('creating transaction', error);
      throw error;
    }
  }

  // ============================================================
  // 3. Consultar estado de transacción
  // ============================================================
  async getTransactionStatus(
    transactionId: string,
  ): Promise<WompiTransactionStatusResponse> {
    try {
      this.logger.log(`Getting status for transaction ${transactionId}...`);
      const response = await firstValueFrom(
        this.httpService.get<WompiTransactionStatusResponse>(
          `${this.baseUrl}/transactions/${transactionId}`,
          {
            headers: {
              Authorization: `Bearer ${this.publicKey}`,
            },
            timeout: this.requestTimeout,
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError('getting transaction status', error);
      throw error;
    }
  }

  // ============================================================
  // 4. Polling hasta estado final
  // ============================================================

  async pollTransactionStatus(
    transactionId: string,
  ): Promise<WompiTransactionStatusResponse> {
    const maxAttempts = Math.floor(this.requestTimeout / this.pollingInterval);
    for (let i = 0; i < maxAttempts; i++) {
      const statusResp = await this.getTransactionStatus(transactionId);
      if (statusResp.data.status !== 'PENDING') {
        this.logger.log(`Final status: ${statusResp.data.status}`);
        return statusResp;
      }
      this.logger.debug(`Still pending... attempt ${i + 1}`);
      await new Promise((resolve) => setTimeout(resolve, this.pollingInterval));
    }
    throw new Error('Polling timeout exceeded');
  }

  // ============================================================
  // Helper para manejo de errores
  // ============================================================
  private handleError(context: string, error: any) {
    this.logger.error(`Error ${context}`, error);
    if (error instanceof AxiosError) {
      const wompiError = error.response?.data as WompiErrorResponse;
      if (wompiError?.error) {
        const errorMessages = Object.values(wompiError.error.messages).flat();
        const errorMessage = errorMessages.join(', ');
        this.logger.error(`Wompi API error: ${errorMessage}`);
      }
    }
  }
}
