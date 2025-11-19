import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsUUID()
  @IsNotEmpty()
  ownerId: string; // FK to User

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  summary?: string;
}
