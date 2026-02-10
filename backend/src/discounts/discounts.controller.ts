import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { Discount } from './discount.entity';

@Controller('api/discounts')
export class DiscountsController {
  constructor(private discountsService: DiscountsService) {}

  @Get()
  findAll() {
    return this.discountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discountsService.findOne(+id);
  }

  @Get('code/:name')
  findByName(@Param('name') name: string) {
    return this.discountsService.findByName(name);
  }

  @Post()
  create(@Body() discount: Partial<Discount>) {
    return this.discountsService.create(discount);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() discount: Partial<Discount>) {
    return this.discountsService.update(+id, discount);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountsService.remove(+id);
  }
}
