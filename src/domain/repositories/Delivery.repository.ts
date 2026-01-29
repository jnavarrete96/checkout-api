import { Delivery } from '../entities/Delivery.entity';

export interface IDeliveryRepository {
  /**
   * Crear una nueva entrega
   */
  create(delivery: Delivery): Promise<Delivery>;

  /**
   * Buscar entrega por ID
   */
  findById(id: string): Promise<Delivery | null>;

  /**
   * Buscar entrega por ID de transacción (relación 1:1)
   */
  findByTransactionId(transactionId: string): Promise<Delivery | null>;

  /**
   * Actualizar entrega
   */
  update(delivery: Delivery): Promise<Delivery>;

  /**
   * Eliminar entrega (opcional)
   */
  delete(id: string): Promise<void>;
}
