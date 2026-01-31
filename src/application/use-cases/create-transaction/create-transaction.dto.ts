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
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  // Customer data
  @ApiProperty({
    description: 'Email del cliente',
    example: 'juan@gmail.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @ApiProperty({
    description: 'Nombre completo del cliente',
    example: 'Juan Pérez',
    minLength: 3,
    maxLength: 100,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  customerFullName: string;

  @ApiProperty({
    description: 'Teléfono del cliente',
    example: '3001234567',
    minLength: 7,
    maxLength: 20,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(7)
  @MaxLength(20)
  customerPhone?: string;

  // Product data
  @ApiProperty({
    description: 'UUID del producto',
    example: '6345d34b-ca16-4374-804d-d58eb2439e25',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Cantidad de productos',
    example: 1,
    minimum: 1,
    required: true,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  // Delivery data
  @ApiProperty({
    description: 'Nombre completo para la entrega',
    example: 'Juan Pérez',
    minLength: 3,
    maxLength: 100,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  deliveryFullName: string;

  @ApiProperty({
    description: 'Teléfono de contacto para la entrega',
    example: '3001234567',
    minLength: 7,
    maxLength: 20,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(20)
  deliveryPhone: string;

  @ApiProperty({
    description: 'Dirección completa de entrega',
    example: 'Calle 123 #45-67 Apto 501',
    minLength: 10,
    maxLength: 200,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  deliveryAddress: string;

  @ApiProperty({
    description: 'Ciudad de entrega',
    example: 'Medellín',
    minLength: 3,
    maxLength: 50,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  deliveryCity: string;

  @ApiProperty({
    description: 'Departamento/Estado de entrega',
    example: 'Antioquia',
    minLength: 3,
    maxLength: 50,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  deliveryState: string;

  @ApiProperty({
    description: 'Código postal (opcional)',
    example: '050001',
    maxLength: 10,
    required: false,
  })
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
