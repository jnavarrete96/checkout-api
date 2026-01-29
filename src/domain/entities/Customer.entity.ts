export class Customer {
  private readonly _id: string;
  private readonly _email: string;
  private _fullName: string;
  private _phone: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: string;
    email: string;
    fullName: string;
    phone?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props.id;
    this._email = props.email;
    this._fullName = props.fullName;
    this._phone = props.phone || null;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  /**
   * Validaciones de negocio
   */
  private validate(): void {
    if (!this._email || this._email.trim().length === 0) {
      throw new Error('Customer email is required');
    }

    if (!this.isValidEmail(this._email)) {
      throw new Error('Customer email is invalid');
    }

    if (!this._fullName || this._fullName.trim().length === 0) {
      throw new Error('Customer full name is required');
    }

    if (this._fullName.trim().length < 3) {
      throw new Error('Customer full name must be at least 3 characters');
    }
  }

  /**
   * Validación simple de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Actualizar información del cliente
   */
  updateInfo(fullName: string, phone?: string): void {
    if (fullName && fullName.trim().length >= 3) {
      this._fullName = fullName;
    }

    if (phone !== undefined) {
      this._phone = phone;
    }

    this._updatedAt = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get fullName(): string {
    return this._fullName;
  }

  get phone(): string | null {
    return this._phone;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Convertir a objeto plano para persistencia
   */
  toObject() {
    return {
      id: this._id,
      email: this._email,
      fullName: this._fullName,
      phone: this._phone,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * Crear desde objeto plano
   */
  static fromPrimitives(props: {
    id: string;
    email: string;
    fullName: string;
    phone?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Customer {
    return new Customer(props);
  }
}
