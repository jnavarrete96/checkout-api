/**
 * Recover Transaction HTTP DTO - Infrastructure Layer
 */

import { IsEmail, IsNotEmpty } from 'class-validator';

export class RecoverTransactionQueryDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class RecoverTransactionResponseDto {
  transaction: {
    id: string;
    transactionNo: string;
    status: string;
    totalAmount: number;
    createdAt: Date;
  };
  product: {
    name: string;
    price: number;
    imageUrl?: string;
  };
  delivery: {
    city: string;
    state: string;
    address: string;
  };
}
