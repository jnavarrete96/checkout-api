export interface CreateTransactionInput {
  customerId: string;
  productId: string;
  quantity: number;
}

export interface CreateTransactionOutput {
  transactionId: string;
  transactionNo: string;
  status: string;
  totalAmount: number;
}
