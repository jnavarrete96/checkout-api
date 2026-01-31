/**
 * Get Transaction DTO - Application Layer
 */

export interface GetTransactionInput {
  transactionId: string;
}

export interface GetTransactionOutput {
  transaction: {
    id: string;
    transactionNo: string;
    status: string;
    amount: number;
    baseFee: number;
    deliveryFee: number;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
  };
  customer: {
    email: string;
    fullName: string;
    phone?: string;
  };
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
  };
  delivery: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode?: string;
  };
  payment?: {
    cardBrand: string;
    cardLastFour: string;
    wompiTransactionId: string;
    wompiReference: string;
  };
}
