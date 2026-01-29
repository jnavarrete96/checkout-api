/**
 * Payment Gateway Interface (PORT) - Domain Layer

 * Define el contrato que debe cumplir la pasarela de pagos Wompi
 */

export interface CardData {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
}

export interface PaymentTransactionData {
  token: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  reference: string;
}

export interface PaymentResult {
  success: boolean;
  status: 'APPROVED' | 'DECLINED' | 'ERROR';
  transactionId: string;
  reference: string;
  message?: string;
  cardBrand?: string;
  cardLastFour?: string;
}

export interface IPaymentGateway {
  /**
   * Tokenizar tarjeta de crédito
   * Convierte datos sensibles en un token seguro
   */
  tokenizeCard(cardData: CardData): Promise<{
    success: boolean;
    token?: string;
    cardBrand?: string;
    cardLastFour?: string;
    error?: string;
  }>;

  /**
   * Crear transacción de pago
   */
  createTransaction(data: PaymentTransactionData): Promise<PaymentResult>;

  /**
   * Consultar estado de transacción
   */
  getTransactionStatus(transactionId: string): Promise<{
    status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR';
    reference: string;
  }>;
}
