import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';


export class CreateAuthDto {

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(50)
    email: string;
  
    @IsString()
    @MinLength(6)
    @MaxLength(255)
    password: string;
  

}
