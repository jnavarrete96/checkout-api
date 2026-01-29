import { GetProductUseCase } from './get-product.use-case';
import { IProductRepository } from '../../../domain';
import { Product } from '../../../domain/entities/Product.entity';

describe('GetProductUseCase', () => {
  let useCase: GetProductUseCase;
  let productRepository: jest.Mocked<IProductRepository>;

  const activeProduct = new Product({
    id: 'product-1',
    name: 'Test Product',
    description: 'Test description',
    price: 1000,
    stockQuantity: 5,
    isActive: true,
  });

  const inactiveProduct = new Product({
    id: 'product-2',
    name: 'Inactive Product',
    price: 1000,
    stockQuantity: 5,
    isActive: false,
  });

  beforeEach(() => {
    productRepository = {
      findById: jest.fn(),
      findAllAvailable: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updateStock: jest.fn(),
    };

    useCase = new GetProductUseCase(productRepository);
  });

  it('should return product successfully', async () => {
    productRepository.findById.mockResolvedValue(activeProduct);

    const result = await useCase.execute({
      productId: 'product-1',
    });

    expect(result.isSuccess).toBe(true);

    if (result.isSuccess) {
      expect(result.value.id).toBe('product-1');
      expect(result.value.name).toBe('Test Product');
      expect(result.value.stockQuantity).toBe(5);
    }
  });

  it('should fail if product does not exist', async () => {
    productRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      productId: 'product-x',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Product not found');
  });

  it('should fail if product is inactive', async () => {
    productRepository.findById.mockResolvedValue(inactiveProduct);

    const result = await useCase.execute({
      productId: 'product-2',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Product is not active');
  });
});
