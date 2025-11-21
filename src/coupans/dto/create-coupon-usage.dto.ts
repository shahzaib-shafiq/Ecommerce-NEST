
import {
    IsString,
    IsUUID,
    IsNumber,
    IsOptional,
    IsEnum,
    IsBoolean,
    IsDateString,
    Min,
  } from 'class-validator';
  import { DiscountType } from '@prisma/client';
  
  // CREATE COUPON USAGE DTO
  export class CreateCouponUsageDto {
    @IsUUID()
    couponId: string;
  
    @IsUUID()
    userId: string;
  
    @IsOptional()
    @IsUUID()
    orderId?: string;
  }
  