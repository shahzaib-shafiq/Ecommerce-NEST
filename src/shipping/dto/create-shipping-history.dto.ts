import {
    IsUUID,
    IsString,
    IsOptional,
    IsEnum,
    IsBoolean,
  } from 'class-validator';
  import { ShippingStatus } from '@prisma/client';
  
export class CreateShippingHistoryDto {
    @IsUUID()
    shippingId: string;
  
    @IsEnum(ShippingStatus)
    status: ShippingStatus;
  
    @IsOptional()
    @IsString()
    location?: string;
  
    @IsOptional()
    @IsString()
    note?: string;
  }
