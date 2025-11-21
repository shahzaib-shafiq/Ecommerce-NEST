import { Module } from '@nestjs/common';
import { CouponService } from './coupans.service';
import { CouponController } from './coupans.controller';

@Module({
  controllers: [CouponController],
  providers: [CouponService],
})
export class CoupansModule {}
