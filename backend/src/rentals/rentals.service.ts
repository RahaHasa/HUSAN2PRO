import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rental, PaymentStatus } from './rental.entity';

@Injectable()
export class RentalsService {
  constructor(
    @InjectRepository(Rental)
    private rentalsRepository: Repository<Rental>,
  ) {}

  findAll() {
    return this.rentalsRepository.find({ relations: ['user', 'product'] });
  }

  findOne(id: number) {
    return this.rentalsRepository.findOne({ where: { id }, relations: ['user', 'product'] });
  }

  create(rental: Partial<Rental>) {
    const newRental = this.rentalsRepository.create({
      ...rental,
      user: { id: rental.user } as any,
      product: { id: rental.product } as any,
    });
    return this.rentalsRepository.save(newRental);
  }

  async update(id: number, rental: Partial<Rental>) {
    await this.rentalsRepository.update(id, rental);
    return this.findOne(id);
  }

  async updatePaymentStatus(id: number, paymentStatus: PaymentStatus) {
    await this.rentalsRepository.update(id, { paymentStatus });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.rentalsRepository.delete(id);
    return { message: 'Rental deleted' };
  }
}
