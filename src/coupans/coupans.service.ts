import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupan.dto';
import { UpdateCouponDto } from './dto/update-coupan.dto';
import { CreateCouponUsageDto } from './dto/create-coupon-usage.dto';
@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------
  // CREATE COUPON
  // ---------------------------------------
  async create(dto: CreateCouponDto) {
    return this.prisma.coupon.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  // ---------------------------------------
  // GET ALL
  // ---------------------------------------
  async findAll() {
    return this.prisma.coupon.findMany({
      where: { isDeleted: false },
      include: {
        usedBy: true,
      },
    });
  }

  // ---------------------------------------
  // GET ONE
  // ---------------------------------------
  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: { usedBy: true },
    });

    if (!coupon) throw new NotFoundException('Coupon not found');

    return coupon;
  }

  // ---------------------------------------
  // UPDATE COUPON
  // ---------------------------------------
  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id);

    return this.prisma.coupon.update({
      where: { id },
      data: dto,
      include: { usedBy: true },
    });
  }

  // ---------------------------------------
  // SOFT DELETE COUPON
  // ---------------------------------------
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.coupon.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });
  }

  // ---------------------------------------
  // APPLY COUPON / CREATE USAGE
  // ---------------------------------------
  async useCoupon(dto: CreateCouponUsageDto) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id: dto.couponId },
      include: {
        usedBy: true,
      },
    });

    if (!coupon) throw new NotFoundException('Coupon not found');
    if (coupon.isDeleted) throw new BadRequestException('Coupon is deleted');
    if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new BadRequestException('Coupon is not valid at this time');
    }

    // TOTAL GLOBAL LIMIT
    if (coupon.usageLimit !== null) {
      const totalUsed = coupon.usedBy.length;
      if (totalUsed >= coupon.usageLimit) {
        throw new BadRequestException('Coupon usage limit reached');
      }
    }

    // PER USER LIMIT
    if (coupon.perUserLimit !== null) {
      const userUsed = coupon.usedBy.filter((u) => u.userId === dto.userId)
        .length;
      if (userUsed >= coupon.perUserLimit) {
        throw new BadRequestException(
          'User usage limit reached for this coupon',
        );
      }
    }

    // VALIDATE USER EXISTS
    const userExists = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!userExists) throw new NotFoundException('User not found');

    // VALIDATE ORDER EXISTS (optional)
    if (dto.orderId) {
      const orderExists = await this.prisma.order.findUnique({
        where: { id: dto.orderId },
      });
      if (!orderExists)
        throw new NotFoundException('Order not found for coupon usage');
    }

    // CREATE COUPON USAGE
    return this.prisma.couponUsage.create({
      data: {
        couponId: dto.couponId,
        userId: dto.userId,
        orderId: dto.orderId,
      },
    });
  }

  // ---------------------------------------
  // GET USAGE BY COUPON
  // ---------------------------------------
  async getUsage(couponId: string) {
    return this.prisma.couponUsage.findMany({
      where: { couponId },
      include: {
        user: true,
        order: true,
      },
    });
  }
}
