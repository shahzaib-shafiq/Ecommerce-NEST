import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { CouponService } from './coupans.service'
import { CreateCouponDto } from './dto/create-coupan.dto';
import { UpdateCouponDto } from './dto/update-coupan.dto';
import { CreateCouponUsageDto } from './dto/create-coupon-usage.dto';
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  @Get()
  findAll() {
    return this.couponService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.remove(id);
  }

  // APPLY COUPON (create usage)
  @Post('use')
  useCoupon(@Body() dto: CreateCouponUsageDto) {
    return this.couponService.useCoupon(dto);
  }

  // GET USAGES
  @Get(':id/usage')
  getUsage(@Param('id') id: string) {
    return this.couponService.getUsage(id);
  }
}
