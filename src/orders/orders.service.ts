import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // ----------------------------
  // CREATE ORDER (UPDATED)
  // ----------------------------
  async create(dto: CreateOrderDto) {
    const { userId, storeId, couponId } = dto;

    // Validate user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Validate store
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store not found');

    // Validate coupon
    if (couponId) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { id: couponId },
      });
      if (!coupon) throw new BadRequestException('Invalid couponId');
    }

    // Fetch real product prices from Product table
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    });

    if (products.length !== dto.items.length) {
      throw new NotFoundException('One or more products were not found');
    }

    // Build orderItems with DB price
    const orderItems = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
    
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }
    
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Safe now
      };
    });
    

    // Calculate total
    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Transaction — order + items + statusHistory + couponUsage
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          storeId,
          total,
          status: OrderStatus.PENDING,

          items: {
            create: orderItems,
          },

          couponUsage: couponId
            ? {
                create: {
                  couponId,
                  userId, // required by Prisma schema
                },
              }
            : undefined,
        },
      });

      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: OrderStatus.PENDING },
      });

      return order;
    });
  }

  // ----------------------------
  // DO NOT CHANGE BELOW THIS
  // ----------------------------

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        shipping: true,
        statusHistory: true,
        couponUsage: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        items: true,
        shipping: true,
        statusHistory: true,
      },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
        },
      });

      return updated;
    });
  }

  async findByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        payments: true,
        shipping: true,
        statusHistory: true,
        couponUsage: true,
      },
    });
  }

  async remove(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
