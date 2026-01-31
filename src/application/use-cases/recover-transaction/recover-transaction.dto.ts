/**
 * Recover Transaction DTO - Application Layer
 */

export interface RecoverTransactionInput {
  email: string;
}

export interface RecoverTransactionOutput {
  transaction: {
    id: string;
    transactionNo: string;
    status: string;
    totalAmount: number;
    createdAt: Date;
  };
  product: {
    name: string;
    price: number;
    imageUrl?: string;
  };
  delivery: {
    city: string;
    state: string;
    address: string;
  };
}
