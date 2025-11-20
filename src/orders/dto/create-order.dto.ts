import { IsUUID, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  storeId: string;

  @IsNumber()
  total: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsUUID()
  couponId?: string;
}
