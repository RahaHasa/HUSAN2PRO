import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discount } from './discount.entity';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private discountsRepository: Repository<Discount>,
  ) {}

  findAll() {
    return this.discountsRepository.find();
  }

  findOne(id: number) {
    return this.discountsRepository.findOne({ where: { id } });
  }

  findByName(name: string) {
    return this.discountsRepository.findOne({ 
      where: { name, isActive: true } 
    });
  }

  create(discount: Partial<Discount>) {
    const newDiscount = this.discountsRepository.create(discount);
    return this.discountsRepository.save(newDiscount);
  }

  async update(id: number, discount: Partial<Discount>) {
    await this.discountsRepository.update(id, discount);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.discountsRepository.delete(id);
    return { message: 'Discount deleted' };
  }
}
