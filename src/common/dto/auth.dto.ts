import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNumber()
  level: number;
}

export class UpdateDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  password: string;
}
