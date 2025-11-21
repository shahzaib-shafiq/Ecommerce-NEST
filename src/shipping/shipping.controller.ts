import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { ShippingService } from './shipping.service';

import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { CreateShippingHistoryDto } from './dto/create-shipping-history.dto';
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  create(@Body() dto: CreateShippingDto) {
    return this.shippingService.create(dto);
  }

  @Get()
  findAll() {
    return this.shippingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shippingService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShippingDto) {
    return this.shippingService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shippingService.remove(id);
  }

  @Post('history')
  createHistory(@Body() dto: CreateShippingHistoryDto) {
    return this.shippingService.createHistory(dto);
  }
}
