import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '@prisma/client';
import { MailService } from '../mails/mails.service';
import { Logger } from '@nestjs/common';
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // ----------------------------
  // CREATE ORDER (UPDATED)
  // ----------------------------
  async create(dto: CreateOrderDto) {
    const { userId, storeId, couponCode } = dto;

    // Validate user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Validate store
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) throw new NotFoundException('Store not found');

    // ----------------------------
    // ✔ Validate coupon (if provided)
    // ----------------------------
    let coupon: any = null;
    let discountAmount = 0;

    if (couponCode) {
      coupon = await this.prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (!coupon) throw new BadRequestException('Invalid couponCode');
      if (!coupon.isActive || coupon.isDeleted)
        throw new BadRequestException('Coupon is inactive');

      // Date validation
      const now = new Date();
      if (coupon.startDate && now < coupon.startDate)
        throw new BadRequestException('Coupon not started yet');

      if (coupon.endDate && now > coupon.endDate)
        throw new BadRequestException('Coupon expired');
    }

    // Fetch product prices
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, name: true },
    });

    if (products.length !== dto.items.length) {
      throw new NotFoundException('One or more products were not found');
    }

    // Build order items + item totals
    const orderItems = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        productName: product.name,
        total: product.price * item.quantity,
      };
    });

    // ----------------------------
    // ✔ Calculate totals
    // ----------------------------
    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);

    // % discount
    if (coupon) {
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (subtotal * coupon.discountValue) / 100;
      } else if (coupon.discountType === 'FIXED') {
        discountAmount = coupon.discountValue;
      }
    }

    const netTotal = Math.max(0, subtotal - discountAmount);

    // ----------------------------
    // ✔ PART 1: Transaction (DB ONLY)
    // ----------------------------
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          storeId,
          total: netTotal,
          status: OrderStatus.PENDING,

          items: {
            create: orderItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price,
            })),
          },
        },
      });

      await tx.orderStatusHistory.create({
        data: { orderId: newOrder.id, status: OrderStatus.PENDING },
      });

      return newOrder;
    });

    // ----------------------------
    // ✔ PART 2: Email (OUTSIDE transaction)
    // ----------------------------
    this.mailService
      .sendOrderCreatedEmail({
        to: user.email,
        subject: `Order #${order.id} Created`,
        order,
      })
      .catch((err) => console.error('Order email failed:', err));

    // ----------------------------
    // ✔ PART 3: Generate Receipt (Final Response)
    // ----------------------------
    const receipt = {
      orderId: order.id,
      user: { id: user.id, email: user.email },
      store: { id: store.id, name: store.name },
      items: orderItems.map((item) => ({
        productId: item.productId,
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
        lineTotal: item.total,
      })),
      subtotal,
      discountPercentage: coupon ? coupon.discountValue + '%' : 0,
      discount: discountAmount,
      couponApplied: coupon ? coupon.code : null,
      netPayable: netTotal,
      currency: 'USD', // or PKR etc.
      timestamp: new Date(),
    };

    // ----------------------------
    // ✔ Final response (order + receipt)
    // ----------------------------
    return {
      order,
      receipt,
    };
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
