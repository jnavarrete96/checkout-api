export interface ListProductsOutput {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  imageUrl?: string | null;
}
