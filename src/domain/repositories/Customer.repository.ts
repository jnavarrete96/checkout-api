import { Customer } from '../entities/Customer.entity';

export interface ICustomerRepository {
  /**
   * Crear un nuevo cliente
   */
  create(customer: Customer): Promise<Customer>;

  /**
   * Buscar cliente por ID
   */
  findById(id: string): Promise<Customer | null>;

  /**
   * Buscar cliente por email (único)
   */
  findByEmail(email: string): Promise<Customer | null>;

  /**
   * Actualizar cliente
   */
  update(customer: Customer): Promise<Customer>;
}
