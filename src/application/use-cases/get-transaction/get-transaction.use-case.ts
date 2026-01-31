/**
 * Get Transaction Use Case - Application Layer
 * Obtiene el detalle completo de una transacción:
 * - Datos de la transacción
 * - Datos del customer
 * - Datos del producto
 * - Datos de delivery
 * - Datos de pago (si existe)
 */

import {
  ITransactionRepository,
  ICustomerRepository,
  IProductRepository,
  IDeliveryRepository,
} from '../../../domain';
import { Result } from '../../../shared/result/resutl';
import {
  GetTransactionInput,
  GetTransactionOutput,
} from './get-transaction.dto';

export class GetTransactionUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly customerRepository: ICustomerRepository,
    private readonly productRepository: IProductRepository,
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async execute(
    input: GetTransactionInput,
  ): Promise<Result<GetTransactionOutput>> {
    // 1. Obtener transacción
    const transaction = await this.transactionRepository.findById(
      input.transactionId,
    );

    if (!transaction) {
      return Result.fail('Transaction not found');
    }

    // 2. Obtener customer
    const customer = await this.customerRepository.findById(
      transaction.customerId,
    );

    if (!customer) {
      return Result.fail('Customer not found');
    }

    // 3. Obtener producto
    const product = await this.productRepository.findById(
      transaction.productId,
    );

    if (!product) {
      return Result.fail('Product not found');
    }

    // 4. Obtener delivery
    const delivery = await this.deliveryRepository.findByTransactionId(
      transaction.id,
    );

    if (!delivery) {
      return Result.fail('Delivery not found');
    }

    // 5. Construir respuesta
    const output: GetTransactionOutput = {
      transaction: {
        id: transaction.id,
        transactionNo: transaction.transactionNo,
        status: transaction.status,
        amount: transaction.amount,
        baseFee: transaction.baseFee,
        deliveryFee: transaction.deliveryFee,
        totalAmount: transaction.totalAmount,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
      customer: {
        email: customer.email,
        fullName: customer.fullName,
        phone: customer.phone ?? undefined,
      },
      product: {
        id: product.id,
        name: product.name,
        description: product.description ?? undefined,
        price: product.price,
        imageUrl: product.imageUrl ?? undefined,
      },
      delivery: {
        fullName: delivery.fullName,
        phone: delivery.phone,
        address: delivery.address,
        city: delivery.city,
        state: delivery.state,
        postalCode: delivery.postalCode ?? undefined,
      },
    };

    // 6. Agregar datos de pago si existe
    if (
      transaction.wompiTransactionId &&
      transaction.cardBrand &&
      transaction.cardLastFour
    ) {
      output.payment = {
        cardBrand: transaction.cardBrand,
        cardLastFour: transaction.cardLastFour,
        wompiTransactionId: transaction.wompiTransactionId,
        wompiReference: transaction.wompiReference ?? transaction.transactionNo,
      };
    }

    return Result.ok(output);
  }
}
