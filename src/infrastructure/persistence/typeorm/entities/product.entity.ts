import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('products')
export class ProductOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string | null;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stockQuantity: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  imageUrl?: string | null;
}
