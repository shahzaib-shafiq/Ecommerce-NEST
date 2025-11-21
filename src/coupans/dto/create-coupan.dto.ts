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
  
  // CREATE COUPON DTO
  export class CreateCouponDto {
    @IsString()
    code: string;
  
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsEnum(DiscountType)
    discountType: DiscountType; // PERCENTAGE or FIXED
  
    @IsNumber()
    discountValue: number;
  
    @IsOptional()
    @IsNumber()
    minOrderAmount?: number;
  
    @IsDateString()
    startDate: string;
  
    @IsDateString()
    endDate: string;
  
    @IsOptional()
    @IsNumber()
    @Min(1)
    usageLimit?: number;
  
    @IsOptional()
    @IsNumber()
    @Min(1)
    perUserLimit?: number;
  
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
  }
  
  // UPDATE COUPON DTO
  export class UpdateCouponDto {
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsOptional()
    @IsEnum(DiscountType)
    discountType?: DiscountType;
  
    @IsOptional()
    @IsNumber()
    discountValue?: number;
  
    @IsOptional()
    @IsNumber()
    minOrderAmount?: number;
  
    @IsOptional()
    @IsDateString()
    startDate?: string;
  
    @IsOptional()
    @IsDateString()
    endDate?: string;
  
    @IsOptional()
    @IsNumber()
    usageLimit?: number;
  
    @IsOptional()
    @IsNumber()
    perUserLimit?: number;
  
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
  
    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;
  }
  