import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { AuthModule } from '../auth/auth.module';
import { ContractService } from './contract.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    AuthModule,
  ],
  providers: [OrdersService, ContractService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
