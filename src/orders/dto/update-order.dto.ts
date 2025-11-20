import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { OrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';
export class UpdateOrderDto extends PartialType(CreateOrderDto) {

  @IsEnum(OrderStatus)
  status: OrderStatus
}
