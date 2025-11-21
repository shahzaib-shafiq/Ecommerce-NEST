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

  async updatePaymentStatus(id: string, dto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });
  
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
  
    // Prevent updating if already final
    if (payment.status === 'PAID') {
      throw new BadRequestException('Payment is already paid');
    }
  
    if (payment.status === 'FAILED') {
      throw new BadRequestException('Payment already failed — cannot update');
    }
  
    if (payment.status === 'REFUNDED') {
      throw new BadRequestException('Payment already refunded — cannot update');
    }
  
    // Optional: prevent updating to the same status
    if (dto.status && dto.status === payment.status) {
      throw new BadRequestException('Payment already has this status');
    }
  
    // Now safe to update the status
    return this.prisma.payment.update({
      where: { id },
      data: {
        status: dto.status,
        transactionId: dto.transactionId,
        metadata: dto.metadata,
      },
    });
  }
  
}
