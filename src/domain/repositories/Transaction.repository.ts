import { Transaction, TransactionStatus } from '../entities/Transaction.entity';

export interface ITransactionRepository {
  /**
   * Crear una nueva transacción
   */
  create(transaction: Transaction): Promise<Transaction>;

  /**
   * Buscar transacción por ID
   */
  findById(id: string): Promise<Transaction | null>;

  /**
   * Buscar transacción por número de transacción
   */
  findByTransactionNo(transactionNo: string): Promise<Transaction | null>;

  /**
   * Buscar transacciones de un cliente
   */
  findByCustomerId(customerId: string): Promise<Transaction[]>;

  /**
   * Buscar última transacción PENDING de un cliente (para resiliencia)
   */
  findPendingByCustomerId(customerId: string): Promise<Transaction | null>;

  /**
   * Actualizar transacción
   */
  update(transaction: Transaction): Promise<Transaction>;

  /**
   * Actualizar solo el estado de una transacción
   */
  updateStatus(id: string, status: TransactionStatus): Promise<void>;

  /**
   * Listar todas las transacciones
   */
  findAll(): Promise<Transaction[]>;
}
