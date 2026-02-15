import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { EmailService } from '../auth/email.service';
import { WhatsAppService } from '../auth/whatsapp.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private emailService: EmailService,
    private whatsAppService: WhatsAppService,
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

  async createWithNotification(orderData: { 
    items: any[]; 
    total: number; 
    notificationMethod: string; 
    contact: string;
    user: any;
  }) {
    // Создаем заказ
    const orderNumber = `ORD${Date.now()}`;
    
    // Создаем заказ с правильной структурой
    const order = this.ordersRepository.create({
      orderNumber,
      user: orderData.user,
      subtotal: orderData.total,
      discountAmount: 0,
      total: orderData.total,
      status: OrderStatus.PENDING,
      deliveryAddress: orderData.contact,
      phone: orderData.contact,
      notes: `Notification: ${orderData.notificationMethod}`
    });
    
    const savedOrder = await this.ordersRepository.save(order);

    // Отправляем уведомление
    try {
      if (orderData.notificationMethod === 'email') {
        await this.emailService.sendOrderNotification(orderData.contact, {
          orderNumber,
          total: orderData.total,
          items: orderData.items,
        });
      } else if (orderData.notificationMethod === 'whatsapp') {
        await this.whatsAppService.sendOrderNotification(orderData.contact, {
          orderNumber,
          total: orderData.total,
          items: orderData.items,
        });
      }
    } catch (error) {
      console.error('Уведомление не отправлено:', error);
      // Заказ создан, но уведомление не отправлено
    }

    return savedOrder;
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
