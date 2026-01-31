import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { CreateTransactionUseCase } from '../../../application/use-cases/create-transaction/create-transaction.use-case';
import { CreateTransactionDto } from '../../../application/use-cases/create-transaction/create-transaction.dto';
import { ProcessPaymentUseCase } from '@application/use-cases/process-payment/process-payment.use-case';
import { ProcessPaymentInput } from '@application/use-cases/process-payment/process-payment.dto';
import { GetTransactionUseCase } from '@application/use-cases/get-transaction/get-transaction.use-case';
import {
  RecoverTransactionQueryDto,
  RecoverTransactionResponseDto,
} from '../dto/recover-transaction.http.dto';
import { RecoverTransactionUseCase } from '@application/use-cases/recover-transaction/recover-transaction.use-case';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
    private readonly recoverTransactionUseCase: RecoverTransactionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear transacción',
    description:
      'Crea una nueva transacción en estado PENDING con datos de cliente, producto y entrega',
  })
  @ApiResponse({
    status: 201,
    description: 'Transacción creada exitosamente',
    schema: {
      example: {
        transactionId: 'uuid-123',
        transactionNo: 'TXN-20260131-001',
        status: 'PENDING',
        totalAmount: 40000,
        customerEmail: 'juan@gmail.com',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validación fallida o error de negocio',
  })
  async createTransaction(@Body() dto: CreateTransactionDto) {
    this.logger.log(`Creating transaction for customer: ${dto.customerEmail}`);

    const result = await this.createTransactionUseCase.execute(dto);

    if (result.isFailure) {
      this.logger.error(`Failed to create transaction: ${result.error}`);
      throw new BadRequestException(result.error);
    }

    this.logger.log(
      `Transaction created successfully: ${result.value.transactionNo}`,
    );

    return result.value;
  }

  @Patch(':id/process-payment')
  @ApiOperation({
    summary: 'Procesar pago con Wompi',
    description:
      'Procesa el pago de una transacción usando la pasarela de pagos Wompi',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la transacción',
    example: 'uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Pago procesado (puede ser APPROVED, DECLINED o ERROR)',
    schema: {
      example: {
        transactionId: 'uuid-123',
        transactionNo: 'TXN-20260131-001',
        status: 'APPROVED',
        totalAmount: 40000,
        wompiTransactionId: '15113-123',
        cardBrand: 'VISA',
        cardLastFour: '4242',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Error en el pago o validación' })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  async processPayment(
    @Param('id') transactionId: string,
    @Body() body: Omit<ProcessPaymentInput, 'transactionId'>,
  ) {
    this.logger.log(`Processing payment for transaction ${transactionId}`);

    const result = await this.processPaymentUseCase.execute({
      transactionId,
      ...body,
    });

    if (result.isFailure) {
      this.logger.error(`Payment failed: ${result.error}`);
      throw new BadRequestException(result.error);
    }

    this.logger.log(`Payment processed successfully: ${result.value.status}`);

    return result.value;
  }

  /**
   * GET /api/transactions/recover?email=xxx
   * Recuperar transacción PENDING por email
   * - Permite al usuario continuar con el pago si cerró el navegador
   * - Devuelve la transacción PENDING más reciente
   * - Útil para resiliencia y mejor UX
   */
  @Get('recover')
  @HttpCode(HttpStatus.OK)
  @Get('recover')
  @ApiOperation({
    summary: 'Recuperar transacción pendiente',
    description:
      'Permite recuperar una transacción PENDING por email si el usuario cerró el navegador',
  })
  @ApiQuery({
    name: 'email',
    description: 'Email del cliente',
    example: 'juan@gmail.com',
  })
  @ApiResponse({ status: 200, description: 'Transacción encontrada' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró transacción pendiente',
  })
  async recoverTransaction(
    @Query() query: RecoverTransactionQueryDto,
  ): Promise<RecoverTransactionResponseDto> {
    this.logger.log(`Recovering transaction for email: ${query.email}`);

    const result = await this.recoverTransactionUseCase.execute({
      email: query.email,
    });

    if (result.isFailure) {
      this.logger.warn(`No pending transaction found for: ${query.email}`);
      throw new NotFoundException(result.error);
    }

    this.logger.log(
      `Transaction recovered: ${result.value.transaction.transactionNo}`,
    );

    return result.value;
  }

  /**
   * GET /api/transactions/:id
   * Obtener detalle completo de una transacción
   * - Datos de la transacción
   * - Datos del customer
   * - Datos del producto
   * - Datos de delivery
   * - Datos de pago (si existe)
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de transacción',
    description:
      'Obtiene información completa de una transacción incluyendo customer, producto, delivery y pago',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la transacción',
    example: 'uuid-123',
  })
  @ApiResponse({ status: 200, description: 'Transacción encontrada' })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  async getTransaction(@Param('id') transactionId: string) {
    this.logger.log(`Getting transaction: ${transactionId}`);

    const result = await this.getTransactionUseCase.execute({ transactionId });

    if (result.isFailure) {
      this.logger.error(`Transaction not found: ${transactionId}`);
      throw new NotFoundException(result.error);
    }

    this.logger.log(`Transaction retrieved: ${transactionId}`);

    return result.value;
  }
}
