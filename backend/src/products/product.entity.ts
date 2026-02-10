import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Rental } from '../rentals/rental.entity';

export enum ProductStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  SOLD = 'sold',
  MAINTENANCE = 'maintenance',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => Category, category => category.products)
  category: Category;

  @Column({ nullable: true })
  mainImage: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.AVAILABLE,
  })
  status: ProductStatus;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pricePerHour: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pricePerDay: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pricePerWeek: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  salePrice: number;

  @Column({ default: true })
  availableForRent: boolean;

  @Column({ default: false })
  availableForSale: boolean;

  @Column({ default: 1 })
  quantity: number;

  @Column('json', { nullable: true })
  specifications: Record<string, any>;

  @OneToMany(() => Rental, rental => rental.product)
  rentals: Rental[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
