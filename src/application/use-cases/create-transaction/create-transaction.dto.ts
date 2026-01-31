export interface CreateTransactionInput {
  // Datos del cliente
  customerEmail: string;
  customerFullName: string;
  customerPhone?: string;
  // Datos del producto
  productId: string;
  quantity: number;
  // Datos de entrega
  deliveryFullName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPostalCode?: string;
}

export interface CreateTransactionOutput {
  transactionId: string;
  transactionNo: string;
  status: string;
  totalAmount: number;
}
