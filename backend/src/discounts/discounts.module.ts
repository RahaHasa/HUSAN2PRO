import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';
import { Discount } from './discount.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Discount])],
  providers: [DiscountsService],
  controllers: [DiscountsController],
  exports: [DiscountsService],
})
export class DiscountsModule {}
