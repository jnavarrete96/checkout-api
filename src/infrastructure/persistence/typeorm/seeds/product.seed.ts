import { DataSource } from 'typeorm';
import { ProductOrmEntity } from '../entities/product.entity';
import { v4 as uuid } from 'uuid';

export async function seedProducts(dataSource: DataSource) {
  const repo = dataSource.getRepository(ProductOrmEntity);

  const count = await repo.count();
  if (count > 0) {
    console.log('🟡 Products already seeded');
    return;
  }

  const productsRaw = [
    {
      id: uuid(),
      name: 'Wireless Headphones',
      description: 'Noise cancelling wireless headphones',
      price: 250000,
      stockQuantity: 10,
      isActive: true,
      imageUrl: 'https://picsum.photos/id/0/5000/3333',
    },
    {
      id: uuid(),
      name: 'Smart Watch',
      description: 'Fitness tracking smart watch',
      price: 180000,
      stockQuantity: 15,
      isActive: true,
      imageUrl: 'https://picsum.photos/id/10/2500/1667',
    },
    {
      id: uuid(),
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard',
      price: 320000,
      stockQuantity: 5,
      isActive: true,
      imageUrl: 'https://picsum.photos/id/20/3670/2462',
    },
    {
      id: uuid(),
      name: 'Gaming Mouse',
      description: 'High precision gaming mouse',
      price: 120000,
      stockQuantity: 20,
      isActive: true,
      imageUrl: 'https://picsum.photos/id/26/4209/2769',
    },
    {
      id: uuid(),
      name: 'Laptop Stand',
      description: 'Ergonomic aluminum laptop stand',
      price: 90000,
      stockQuantity: 12,
      isActive: true,
      imageUrl: 'https://picsum.photos/id/27/3264/1836',
    },
    {
      id: uuid(),
      name: 'Bluetooth Speaker',
      description: 'Portable bluetooth speaker',
      price: 150000,
      stockQuantity: 8,
      isActive: true,
      imageUrl: 'https://picsum.photos/id/28/4928/3264',
    },
    {
      id: uuid(),
      name: 'USB-C Hub',
      description: 'Multiport USB-C hub',
      price: 110000,
      stockQuantity: 25,
      isActive: true,
      imageUrl: 'https://picsum.photos/id/29/4000/2670',
    },
    {
      id: uuid(),
      name: 'Noise Cancelling Earbuds',
      description: 'In-ear noise cancelling earbuds',
      price: 200000,
      stockQuantity: 18,
      isActive: true,
      imageUrl: 'https://picsum.photos/id/5/5000/3334',
    },
  ];

  const products = repo.create(productsRaw);

  await repo.save(products);

  console.log('✅ Products seeded successfully');
}
