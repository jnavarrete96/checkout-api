/**
 * Process Payment Use Case - Application Layer

 * Procesa el pago de una transacción existente usando Wompi:
 * 1. Tokeniza la tarjeta
 * 2. Crea transacción en Wompi
 * 3. Hace polling hasta obtener estado final
 * 4. Actualiza la transaction y el stock según el resultado
 */

import {
  ITransactionRepository,
  IProductRepository,
  ICustomerRepository,
} from '../../../domain';
import { Result } from '../../../shared/result/resutl';
import {
  ProcessPaymentInput,
  ProcessPaymentOutput,
} from './process-payment.dto';
import { WompiService } from '../../../infrastructure/external/wompi/wompi.service';

export class ProcessPaymentUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly productRepository: IProductRepository,
    private readonly customerRepository: ICustomerRepository,
    private readonly wompiService: WompiService,
  ) {}

  async execute(
    input: ProcessPaymentInput,
  ): Promise<Result<ProcessPaymentOutput>> {
    // 1. Obtener transacción
    const transaction = await this.transactionRepository.findById(
      input.transactionId,
    );

    if (!transaction) {
      return Result.fail('Transaction not found');
    }

    // 2. Verificar que la transacción puede ser procesada
    if (!transaction.canBeProcessed()) {
      return Result.fail(
        `Transaction cannot be processed. Current status: ${transaction.status}`,
      );
    }

    // 3. Obtener customer para el email
    const customer = await this.customerRepository.findById(
      transaction.customerId,
    );

    if (!customer) {
      return Result.fail('Customer not found');
    }

    // 4. PASO 1: Tokenizar tarjeta
    const tokenResult = await this.wompiService.tokenizeCard({
      number: input.cardNumber,
      expMonth: input.cardExpMonth,
      expYear: input.cardExpYear,
      cvc: input.cardCvc,
      cardHolder: input.cardHolder,
    });

    if (!tokenResult.success) {
      return Result.fail(tokenResult.error ?? 'Card tokenization failed');
    }

    // ⚠️ A partir de aquí, ya NO usamos input.cardNumber
    // Solo usamos: tokenResult.token

    try {
      // 5. PASO 2: Crear transacción en Wompi
      const wompiTxResponse = await this.wompiService.createTransaction({
        amount_in_cents: Math.round(transaction.totalAmount * 100), // Convertir a centavos
        currency: 'COP',
        customer_email: customer.email,
        reference: transaction.transactionNo,
        payment_method: {
          type: 'CARD',
          token: tokenResult.token!,
          installments: 1,
        },
      });

      // 6. PASO 3: Polling para obtener estado final
      let finalStatus = wompiTxResponse.data.status;
      const wompiTransactionId = wompiTxResponse.data.id;
      const wompiReference = wompiTxResponse.data.reference;

      if (finalStatus === 'PENDING') {
        const statusResponse =
          await this.wompiService.pollTransactionStatus(wompiTransactionId);
        finalStatus = statusResponse.data.status;
      }

      // 7. Actualizar transacción según resultado
      if (finalStatus === 'APPROVED') {
        // 7a. Aprobar transacción
        transaction.approve({
          transactionId: wompiTransactionId,
          reference: wompiReference,
          cardBrand: tokenResult.cardBrand,
          cardLastFour: tokenResult.cardLastFour,
        });

        await this.transactionRepository.update(transaction);

        // 7b. Actualizar stock del producto
        const product = await this.productRepository.findById(
          transaction.productId,
        );

        if (product) {
          product.decreaseStock(1);
          await this.productRepository.update(product);
        }

        return Result.ok({
          transactionId: transaction.id,
          transactionNo: transaction.transactionNo,
          status: 'APPROVED',
          totalAmount: transaction.totalAmount,
          wompiTransactionId: transaction.wompiTransactionId!,
          wompiReference: transaction.wompiReference!,
          cardBrand: transaction.cardBrand ?? undefined,
          cardLastFour: transaction.cardLastFour ?? undefined,
          message: 'Payment processed successfully',
        });
      } else if (finalStatus === 'DECLINED') {
        // 7c. Rechazar transacción
        transaction.decline({
          transactionId: wompiTransactionId,
          reference: wompiReference,
        });

        await this.transactionRepository.update(transaction);

        return Result.ok({
          transactionId: transaction.id,
          transactionNo: transaction.transactionNo,
          status: 'DECLINED',
          totalAmount: transaction.totalAmount,
          wompiTransactionId: transaction.wompiTransactionId!,
          wompiReference: transaction.wompiReference!,
          cardBrand: transaction.cardBrand ?? undefined,
          cardLastFour: transaction.cardLastFour ?? undefined,
          message: 'Payment declined by payment gateway',
        });
      } else {
        // 7d. Marcar como error
        transaction.markAsError({
          transactionId: wompiTransactionId,
          reference: wompiReference,
        });

        await this.transactionRepository.update(transaction);

        return Result.fail('Payment error occurred');
      }
    } catch (error) {
      // Error al comunicarse con Wompi
      return Result.fail(
        `Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
