import { IsUUID, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  storeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsUUID()
  couponId?: string;
}
