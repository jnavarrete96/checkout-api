import { Product } from '../entities/Product.entity';

export interface IProductRepository {
  /**
   * Buscar producto por ID
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Listar todos los productos activos con stock
   */
  findAllAvailable(): Promise<Product[]>;

  /**
   * Listar todos los productos
   */
  findAll(): Promise<Product[]>;

  /**
   * Actualizar producto
   */
  update(product: Product): Promise<Product>;

  /**
   * Actualizar solo el stock de un producto
   */
  updateStock(id: string, newStock: number): Promise<void>;
}
