import { v4 as uuid } from 'uuid';
import {
  ICustomerRepository,
  IProductRepository,
  ITransactionRepository,
  IDeliveryRepository,
} from '../../../domain';
import { Result } from '../../../shared/result/resutl';
import {
  CreateTransactionInput,
  CreateTransactionOutput,
} from './create-transaction.dto';
import { Transaction } from '../../../domain/entities/Transaction.entity';
import { Delivery } from '../../../domain/entities/Delivery.entity';
import { Customer } from '../../../domain/entities/Customer.entity';

export class CreateTransactionUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly productRepository: IProductRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async execute(
    input: CreateTransactionInput,
  ): Promise<Result<CreateTransactionOutput>> {
    const customer = await this.findOrCreateCustomer(
      input.customerEmail,
      input.customerFullName,
      input.customerPhone,
    );

    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      return Result.fail('Product not found');
    }

    if (!product.isActive) {
      return Result.fail('Product not available');
    }

    if (!product.hasStock(input.quantity)) {
      return Result.fail('Insufficient stock');
    }

    const baseFee = Number(process.env.BASE_FEE ?? 0);
    const deliveryFee = Number(process.env.DELIVERY_FEE ?? 0);

    const amount = product.price * input.quantity;
    const totalAmount = amount + baseFee + deliveryFee;

    const transaction = new Transaction({
      id: uuid(),
      transactionNo: this.generateTransactionNo(),
      productId: product.id,
      customerId: customer.id,
      amount,
      baseFee: baseFee,
      deliveryFee: deliveryFee,
      totalAmount,
    });

    await this.transactionRepository.create(transaction);

    // 6. Crear delivery
    const delivery = new Delivery({
      id: uuid(),
      transactionId: transaction.id,
      fullName: input.deliveryFullName,
      phone: input.deliveryPhone,
      address: input.deliveryAddress,
      city: input.deliveryCity,
      state: input.deliveryState,
      postalCode: input.deliveryPostalCode,
    });

    await this.deliveryRepository.create(delivery);

    return Result.ok({
      transactionId: transaction.id,
      transactionNo: transaction.transactionNo,
      status: transaction.status,
      totalAmount: transaction.totalAmount,
    });
  }

  /**
   * Buscar customer por email, crear si no existe, actualizar si cambió
   */
  private async findOrCreateCustomer(
    email: string,
    fullName: string,
    phone?: string,
  ): Promise<Customer> {
    let customer = await this.customerRepository.findByEmail(email);

    if (customer) {
      // Cliente existente - actualizar datos si cambió algo
      if (fullName !== customer.fullName || phone !== customer.phone) {
        customer.updateInfo(fullName, phone);
        await this.customerRepository.update(customer);
      }
    } else {
      customer = new Customer({
        id: uuid(),
        email,
        fullName,
        phone,
      });
      await this.customerRepository.create(customer);
    }

    return customer;
  }

  private generateTransactionNo(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const timestamp = Date.now();

    return `TXN-${year}${month}${day}-${timestamp}`;
  }
}
