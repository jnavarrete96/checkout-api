import { v4 as uuid } from 'uuid';
import {
  ICustomerRepository,
  IProductRepository,
  ITransactionRepository,
} from '../../../domain';
import { Result } from '../../../shared/result/resutl';
import {
  CreateTransactionInput,
  CreateTransactionOutput,
} from './create-transaction.dto';
import { Transaction } from '../../../domain/entities/Transaction.entity';

const baseFee = Number(process.env.BASE_FEE ?? 0);
const deliveryFee = Number(process.env.DELIVERY_FEE ?? 0);

export class CreateTransactionUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly productRepository: IProductRepository,
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(
    input: CreateTransactionInput,
  ): Promise<Result<CreateTransactionOutput>> {
    const customer = await this.customerRepository.findById(input.customerId);
    if (!customer) {
      return Result.fail('Customer not found');
    }

    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      return Result.fail('Product not found');
    }

    if (product.stockQuantity < input.quantity) {
      return Result.fail('Insufficient stock');
    }

    const amount = product.price * input.quantity;
    const totalAmount = amount + baseFee + deliveryFee;

    const transaction = new Transaction({
      id: uuid(),
      transactionNo: `TXN-${Date.now()}`,
      productId: product.id,
      customerId: customer.id,
      amount,
      baseFee: baseFee,
      deliveryFee: deliveryFee,
      totalAmount,
    });

    await this.transactionRepository.create(transaction);

    return Result.ok({
      transactionId: transaction.id,
      transactionNo: transaction.transactionNo,
      status: transaction.status,
      totalAmount: transaction.totalAmount,
    });
  }
}
