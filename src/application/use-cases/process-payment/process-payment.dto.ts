/**
 * Process Payment DTO - Application Layer
 */

export interface ProcessPaymentInput {
  transactionId: string;
  // Card data
  cardNumber: string;
  cardExpMonth: string;
  cardExpYear: string;
  cardCvc: string;
  cardHolder: string;
}

export interface ProcessPaymentOutput {
  transactionId: string;
  transactionNo: string;
  status: 'APPROVED' | 'DECLINED' | 'ERROR';
  totalAmount: number;
  wompiTransactionId: string;
  wompiReference: string;
  cardBrand?: string;
  cardLastFour?: string;
  message?: string;
}
