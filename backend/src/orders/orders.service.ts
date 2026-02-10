import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  findAll() {
    return this.ordersRepository.find({ relations: ['user', 'items', 'items.product'] });
  }

  findOne(id: number) {
    return this.ordersRepository.findOne({ where: { id }, relations: ['user', 'items', 'items.product'] });
  }

  create(order: Partial<Order>) {
    const newOrder = this.ordersRepository.create(order);
    return this.ordersRepository.save(newOrder);
  }

  async update(id: number, order: Partial<Order>) {
    await this.ordersRepository.update(id, order);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.ordersRepository.delete(id);
    return { message: 'Order deleted' };
  }
}
