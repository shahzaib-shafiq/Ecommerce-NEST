import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // --------------------------------------------------
  // CREATE ORDER
  // POST /orders
  // --------------------------------------------------
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // --------------------------------------------------
  // GET ALL ORDERS
  // GET /orders
  // --------------------------------------------------
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // --------------------------------------------------
  // GET ORDER BY ID
  // GET /orders/:id
  // --------------------------------------------------
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id); // UUID → do NOT convert to number
  }

  // --------------------------------------------------
  // GET ORDERS BY USER
  // GET /orders/user/:userId
  // --------------------------------------------------
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.ordersService.findByUser(userId);
  }

  // --------------------------------------------------
  // UPDATE ORDER
  // PATCH /orders/:id
  // --------------------------------------------------
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
  //   return this.ordersService.update(id, dto); // UUID correct
  // }

  // --------------------------------------------------
  // DELETE ORDER
  // DELETE /orders/:id
  // --------------------------------------------------
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id); // UUID correct
  }
}
