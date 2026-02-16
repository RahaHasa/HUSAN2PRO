import { Controller, Get, Post, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { OrdersService } from './orders.service';
import { ContractService } from './contract.service';
import { Order } from './order.entity';

@Controller('api/orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private contractService: ContractService,
  ) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Get(':id/contract')
  async downloadContract(@Param('id') id: string, @Res() res: Response) {
    try {
      const order = await this.ordersService.findOne(+id);
      
      if (!order) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'Заказ не найден' });
      }

      const doc = this.contractService.generateContract(order);

      // Установка заголовков для PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=contract-${order.orderNumber}.pdf`);

      // Отправка PDF
      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error('Ошибка генерации договора:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: 'Ошибка генерации договора',
        error: error.message 
      });
    }
  }

  @Post()
  create(@Body() order: Partial<Order>) {
    return this.ordersService.create(order);
  }

  @Post('with-notification')
  createWithNotification(@Body() orderData: any) {
    return this.ordersService.createWithNotification(orderData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() order: Partial<Order>) {
    return this.ordersService.update(+id, order);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
