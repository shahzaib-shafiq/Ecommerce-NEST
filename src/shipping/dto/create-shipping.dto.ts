import {
    IsUUID,
    IsString,
    IsOptional,
    IsEnum,
    IsBoolean,
  } from 'class-validator';
  import { ShippingStatus } from '@prisma/client';
  
  // CREATE SHIPPING DTO
  export class CreateShippingDto {
    @IsUUID()
    orderId: string;
  
    @IsString()
    provider: string;
  
    @IsOptional()
    @IsString()
    trackingNumber?: string;
  
    @IsOptional()
    @IsEnum(ShippingStatus)
    status?: ShippingStatus;
  
    @IsOptional()
    @IsUUID()
    addressId?: string;
  }
  
  // UPDATE SHIPPING DTO
  export class UpdateShippingDto {
    @IsOptional()
    @IsString()
    provider?: string;
  
    @IsOptional()
    @IsString()
    trackingNumber?: string;
  
    @IsOptional()
    @IsEnum(ShippingStatus)
    status?: ShippingStatus;
  
    @IsOptional()
    @IsUUID()
    addressId?: string;
  
    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;
  }

  