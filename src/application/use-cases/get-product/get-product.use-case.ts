import { IProductRepository } from '../../../domain';
import { Result } from '../../../shared/result/resutl';
import { GetProductInput, GetProductOutput } from './get-product.dto';

export class GetProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: GetProductInput): Promise<Result<GetProductOutput>> {
    const product = await this.productRepository.findById(input.productId);

    if (!product) {
      return Result.fail('Product not found');
    }

    if (!product.isActive) {
      return Result.fail('Product is not active');
    }

    return Result.ok({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl,
    });
  }
}
