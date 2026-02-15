import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';

@Controller('api/orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
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
