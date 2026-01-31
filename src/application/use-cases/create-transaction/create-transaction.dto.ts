// src/application/dtos/create-transaction.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateTransactionDto {
  // Customer data
  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  customerFullName: string;

  @IsString()
  @IsOptional()
  @MinLength(7)
  @MaxLength(20)
  customerPhone?: string;

  // Product data
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  // Delivery data
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  deliveryFullName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(20)
  deliveryPhone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  deliveryAddress: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  deliveryCity: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  deliveryState: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  deliveryPostalCode?: string;
}

// Mismo DTO para input y output del use case
export type CreateTransactionInput = CreateTransactionDto;

export interface CreateTransactionOutput {
  transactionId: string;
  transactionNo: string;
  status: string;
  totalAmount: number;
}
