import { Injectable, NotFoundException ,BadGatewayException,BadRequestException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    // 1. Check if order exists
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
  
    if (!order) {
      throw new NotFoundException('Order not found');
    }
  
    // 2. Ensure only 1 payment per order
    const existingPayment = await this.prisma.payment.findFirst({
      where: { orderId: dto.orderId },
    });
  
    if (existingPayment) {
      throw new BadRequestException('Payment already exists for this order');
    }
  
    // 3. Override amount using the order.total
    const finalAmount = order.total;
  
    return this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        amount: finalAmount,
        method: dto.method,
        status: dto.status ?? 'PENDING',
        transactionId: dto.transactionId,
        metadata: dto.metadata,
      },
      include: {
        order: true,
      },
    });
  }
  

  async findAll() {
    return this.prisma.payment.findMany({
      include: {
        order: true,
      },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto) {
    return this.prisma.payment.update({
      where: { id },
      data: dto,
      include: {
        order: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.payment.delete({
      where: { id },
    });
  }
}
