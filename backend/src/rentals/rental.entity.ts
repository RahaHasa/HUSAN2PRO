import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

export enum RentalStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('rentals')
export class Rental {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.rentals)
  user: User;

  @ManyToOne(() => Product, product => product.rentals)
  product: Product;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  rentalPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: RentalStatus,
    default: RentalStatus.PENDING,
  })
  status: RentalStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
