/**
 * Recover Transaction HTTP DTO - Infrastructure Layer
 */

import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecoverTransactionQueryDto {
  @ApiProperty({
    description: 'Email del cliente para buscar transacciones pendientes',
    example: 'juan@gmail.com',
  })
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
