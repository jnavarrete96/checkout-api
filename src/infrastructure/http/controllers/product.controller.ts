import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetProductUseCase } from '../../../application/use-cases/get-product/get-product.use-case';
import { ListProductsUseCase } from '../../../application/use-cases/list-products/list-products.use-case';
import { GetProductOutput } from '../../../application/use-cases/get-product/get-product.dto';
import { ListProductsOutput } from '../../../application/use-cases/list-products/list-products.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar productos disponibles',
    description:
      'Obtiene todos los productos activos que tienen stock disponible',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente',
    schema: {
      example: [
        {
          id: '6345d34b-ca16-4374-804d-d58eb2439e25',
          name: 'Wireless Headphones',
          description: 'Noise cancelling wireless headphones',
          price: 25000,
          stockQuantity: 10,
          imageUrl: 'https://example.com/headphones.jpg',
          isActive: true,
        },
      ],
    },
  })
  async list(): Promise<ListProductsOutput[]> {
    const result = await this.listProducts.execute();

    if (!result.isSuccess) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result.value;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener detalle de producto',
    description:
      'Obtiene la información completa de un producto específico por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del producto',
    example: '6345d34b-ca16-4374-804d-d58eb2439e25',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado',
    schema: {
      example: {
        id: '6345d34b-ca16-4374-804d-d58eb2439e25',
        name: 'Wireless Headphones',
        description: 'Noise cancelling wireless headphones',
        price: 25000,
        stockQuantity: 10,
        imageUrl: 'https://example.com/headphones.jpg',
        isActive: true,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Product not found',
        error: 'Not Found',
      },
    },
  })
  async getById(@Param('id') id: string): Promise<GetProductOutput> {
    const result = await this.getProduct.execute({ productId: id });

    if (!result.isSuccess) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }

    return result.value;
  }
}
