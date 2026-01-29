import { ListProductsUseCase } from './list-products.use-case';
import { IProductRepository } from '../../../domain';
import { Product } from '../../../domain/entities/Product.entity';

describe('ListProductsUseCase', () => {
  let useCase: ListProductsUseCase;
  let productRepository: jest.Mocked<IProductRepository>;

  const product1 = new Product({
    id: 'product-1',
    name: 'Product 1',
    price: 1000,
    stockQuantity: 5,
    isActive: true,
  });

  const product2 = new Product({
    id: 'product-2',
    name: 'Product 2',
    price: 2000,
    stockQuantity: 10,
    isActive: true,
  });

  beforeEach(() => {
    productRepository = {
      findById: jest.fn(),
      findAllAvailable: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updateStock: jest.fn(),
    };

    useCase = new ListProductsUseCase(productRepository);
  });

  it('should list available products successfully', async () => {
    productRepository.findAllAvailable.mockResolvedValue([product1, product2]);

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);

    if (result.isSuccess) {
      expect(result.value).toHaveLength(2);
      expect(result.value[0].id).toBe('product-1');
      expect(result.value[1].price).toBe(2000);
    }

    expect(productRepository.findAllAvailable).toHaveBeenCalledTimes(1);
  });

  it('should return empty array if no products available', async () => {
    productRepository.findAllAvailable.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);

    if (result.isSuccess) {
      expect(result.value).toEqual([]);
    }
  });
});
