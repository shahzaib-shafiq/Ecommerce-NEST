import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { CreateShippingHistoryDto } from './dto/create-shipping-history.dto';
@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  // -------------------------
  // CREATE SHIPPING
  // -------------------------
  async create(dto: CreateShippingDto) {
    // 1. Validate order exists
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // 2. Ensure only one shipping per order
    const existing = await this.prisma.shipping.findUnique({
      where: { orderId: dto.orderId },
    });
    if (existing) {
      throw new BadRequestException('Shipping already exists for this order');
    }

    // 3. Validate address exists (if provided)
    if (dto.addressId) {
      const address = await this.prisma.address.findUnique({
        where: { id: dto.addressId },
      });
      if (!address) {
        throw new NotFoundException('Address not found');
      }
    }

    // 4. Create shipping
    const shipping = await this.prisma.shipping.create({
      data: {
        orderId: dto.orderId,
        provider: dto.provider,
        trackingNumber: dto.trackingNumber,
        status: dto.status ?? 'PENDING',
        addressId: dto.addressId,
      },
      include: {
        order: true,
        address: true,
      },
    });

    // 5. Auto-add history record
    await this.createHistory({
      shippingId: shipping.id,
      status: shipping.status,
      note: 'Shipping created',
    });

    return shipping;
  }

  // -------------------------
  // GET ALL
  // -------------------------
  async findAll() {
    return this.prisma.shipping.findMany({
      where: { isDeleted: false },
      include: {
        order: true,
        address: true,
        history: true,
      },
    });
  }

  // -------------------------
  // GET ONE
  // -------------------------
  async findOne(id: string) {
    const shipping = await this.prisma.shipping.findUnique({
      where: { id },
      include: {
        order: true,
        address: true,
        history: true,
      },
    });

    if (!shipping) {
      throw new NotFoundException('Shipping not found');
    }

    return shipping;
  }

  // -------------------------
  // UPDATE SHIPPING
  // -------------------------
  async update(id: string, dto: UpdateShippingDto) {
    const shipping = await this.findOne(id);

    // push history if status changed
    if (dto.status && dto.status !== shipping.status) {
      await this.createHistory({
        shippingId: id,
        status: dto.status,
        note: 'Status updated',
      });
    }

    return this.prisma.shipping.update({
      where: { id },
      data: dto,
      include: {
        order: true,
        address: true,
        history: true,
      },
    });
  }

  // -------------------------
  // SOFT DELETE
  // -------------------------
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.shipping.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  // -------------------------
  // ADD HISTORY ENTRY
  // -------------------------
  async createHistory(dto: CreateShippingHistoryDto) {
    return this.prisma.shippingHistory.create({
      data: dto,
    });
  }
}
