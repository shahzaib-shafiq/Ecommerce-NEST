import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateAddressDto {
  @IsUUID()
  userId: string;

  @IsString()
  line1: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  postal: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
