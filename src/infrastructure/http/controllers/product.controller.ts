import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GetProductUseCase } from '../../../application/use-cases/get-product/get-product.use-case';
import { ListProductsUseCase } from '../../../application/use-cases/list-products/list-products.use-case';
import { GetProductOutput } from '../../../application/use-cases/get-product/get-product.dto';
import { ListProductsOutput } from '../../../application/use-cases/list-products/list-products.dto';

@Controller('products')
export class ProductController {
  constructor(
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
  ) {}

  @Get()
  async list(): Promise<ListProductsOutput[]> {
    const result = await this.listProducts.execute();

    if (!result.isSuccess) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result.value;
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<GetProductOutput> {
    const result = await this.getProduct.execute({ productId: id });

    if (!result.isSuccess) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }

    return result.value;
  }
}
