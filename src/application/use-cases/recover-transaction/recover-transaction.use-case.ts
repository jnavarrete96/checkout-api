/**
 * Recover Transaction Use Case - Application Layer
 * Permite recuperar una transacción PENDING por email.
 * Útil cuando el usuario cierra el navegador antes de completar el pago.

 * Reglas de negocio:
 * - Solo devuelve transacciones PENDING
 * - Solo del email especificado
 * - Devuelve la más reciente
 */

import {
  ITransactionRepository,
  ICustomerRepository,
  IProductRepository,
  IDeliveryRepository,
} from '../../../domain';
import { Result } from '../../../shared/result/resutl';
import {
  RecoverTransactionInput,
  RecoverTransactionOutput,
} from './recover-transaction.dto';

export class RecoverTransactionUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly customerRepository: ICustomerRepository,
    private readonly productRepository: IProductRepository,
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async execute(
    input: RecoverTransactionInput,
  ): Promise<Result<RecoverTransactionOutput>> {
    // 1. Buscar customer por email
    const customer = await this.customerRepository.findByEmail(input.email);

    if (!customer) {
      return Result.fail('No pending transactions found for this email');
    }

    // 2. Buscar transacción PENDING del customer (la más reciente)
    const transaction =
      await this.transactionRepository.findPendingByCustomerId(customer.id);

    if (!transaction) {
      return Result.fail('No pending transactions found for this email');
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
    const output: RecoverTransactionOutput = {
      transaction: {
        id: transaction.id,
        transactionNo: transaction.transactionNo,
        status: transaction.status,
        totalAmount: transaction.totalAmount,
        createdAt: transaction.createdAt,
      },
      product: {
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl ?? undefined,
      },
      delivery: {
        city: delivery.city,
        state: delivery.state,
        address: delivery.address,
      },
    };

    return Result.ok(output);
  }
}
