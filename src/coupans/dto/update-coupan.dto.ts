import { PartialType } from '@nestjs/mapped-types';
import { CreateCouponDto } from './create-coupan.dto';
import { IsOptional, IsString, IsEnum, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { DiscountType } from '@prisma/client';
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