import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { RentalsModule } from './rentals/rentals.module';
import { OrdersModule } from './orders/orders.module';
import { DiscountsModule } from './discounts/discounts.module';
import { getTypeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    RentalsModule,
    OrdersModule,
    DiscountsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
