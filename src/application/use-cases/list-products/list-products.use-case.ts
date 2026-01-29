import { IProductRepository } from '../../../domain';
import { Result } from '../../../shared/result/resutl';
import { ListProductsOutput } from './list-products.dto';

export class ListProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(): Promise<Result<ListProductsOutput[]>> {
    const products = await this.productRepository.findAllAvailable();

    return Result.ok(
      products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stockQuantity: product.stockQuantity,
        imageUrl: product.imageUrl,
      })),
    );
  }
}
