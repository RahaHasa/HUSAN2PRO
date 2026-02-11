import { Controller, Get, Post, Put, Delete, Body, Param, Patch } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { Rental, PaymentStatus } from './rental.entity';

@Controller('api/rentals')
export class RentalsController {
  constructor(private rentalsService: RentalsService) {}

  @Get()
  findAll() {
    return this.rentalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentalsService.findOne(+id);
  }

  @Post()
  create(@Body() rental: Partial<Rental>) {
    return this.rentalsService.create(rental);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() rental: Partial<Rental>) {
    return this.rentalsService.update(+id, rental);
  }

  @Patch(':id/payment')
  updatePaymentStatus(@Param('id') id: string, @Body() body: { paymentStatus: PaymentStatus }) {
    return this.rentalsService.updatePaymentStatus(+id, body.paymentStatus);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rentalsService.remove(+id);
  }
}
