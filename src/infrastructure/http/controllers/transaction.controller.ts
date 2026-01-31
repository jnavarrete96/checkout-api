import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateTransactionUseCase } from '../../../application/use-cases/create-transaction/create-transaction.use-case';
import { CreateTransactionDto } from '../../../application/use-cases/create-transaction/create-transaction.dto';
import { ProcessPaymentUseCase } from '@application/use-cases/process-payment/process-payment.use-case';
import { ProcessPaymentInput } from '@application/use-cases/process-payment/process-payment.dto';
import { GetTransactionUseCase } from '@application/use-cases/get-transaction/get-transaction.use-case';

@Controller('transactions')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
