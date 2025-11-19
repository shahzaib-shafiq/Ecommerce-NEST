import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // ----------------------------
  // CREATE ORDER
  // ----------------------------
  async create(dto: CreateOrderDto) {
    // Calculate total price
    let total = 0;

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) throw new NotFoundException('Product not found');

      total += product.price * item.quantity;
    }

    // Create order + items
    return await this.prisma.order.create({
      data: {
        userId: dto.userId,
        storeId: dto.storeId,
        total,
        status: OrderStatus.PAID,
        items: {
          create: dto.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: total, // Or product.price
          })),
        },
      },
      include: { items: true },
    });
  }

  // ----------------------------
  // FIND ALL ORDERS
  // ----------------------------
  async findAll() {
    return await this.prisma.order.findMany({
      include: { items: true, user: true, store: true },
    });
  }

  // ----------------------------
  // FIND ONE ORDER
  // ----------------------------
  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, user: true, store: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  // ----------------------------
  // UPDATE ORDER
  // // ----------------------------
  // async update(id: string, dto: UpdateOrderDto) {
  //   const exists = await this.prisma.order.findUnique({ where: { id } });
  //   if (!exists) throw new NotFoundException('Order not found');
  
  //   // CLEAN DTO ❗
  //   const { userId, storeId, ...allowedData } = dto; // remove forbidden fields
  
  //   return await this.prisma.order.update({
  //     where: { id },
  //     data: allowedData,
  //   });
  // }
  
  // ----------------------------
  // DELETE ORDER
  // ----------------------------
  async remove(id: string) {
    const exists = await this.prisma.order.findUnique({ where: { id } });

    if (!exists) throw new NotFoundException('Order not found');

    return await this.prisma.order.delete({
      where: { id },
    });
  }


  // ----------------------------
// FIND ORDERS BY USER
// ----------------------------
async findByUser(userId: string) {
  return await this.prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
      store: true,
      user: true,
      payments: true,
      shipping: true,
      statusHistory: true,
    },
  });
}

}
