export interface GetProductInput {
  productId: string;
}

export interface GetProductOutput {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  imageUrl?: string | null;
}
