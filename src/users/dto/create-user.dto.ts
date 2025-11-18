import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { Role } from '@prisma/client';  // If you're using Prisma enums directly

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  adress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  phone?: string;
}
