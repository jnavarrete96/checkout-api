import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CreateTransactionUseCase } from '../../../application/use-cases/create-transaction/create-transaction.use-case';
import { CreateTransactionDto } from '../../../application/use-cases/create-transaction/create-transaction.dto';

@Controller('transactions')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
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
}
