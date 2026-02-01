export class Delivery {
  private readonly _id: string;
  private readonly _transactionId: string;
  private _fullName: string;
  private _phone: string;
  private _address: string;
  private _city: string;
  private _state: string;
  private _postalCode: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: string;
    transactionId: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props.id;
    this._transactionId = props.transactionId;
    this._fullName = props.fullName;
    this._phone = props.phone;
    this._address = props.address;
    this._city = props.city;
    this._state = props.state;
    this._postalCode = props.postalCode || null;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  /**
   * Validaciones de negocio
   */
  private validate(): void {
    if (!this._transactionId || this._transactionId.trim().length === 0) {
      throw new Error('Transaction ID is required');
    }

    if (!this._fullName || this._fullName.trim().length === 0) {
      throw new Error('Delivery full name is required');
    }

    if (this._fullName.trim().length < 3) {
      throw new Error('Delivery full name must be at least 3 characters');
    }

    if (!this._phone || this._phone.trim().length === 0) {
      throw new Error('Delivery phone is required');
    }

    if (!this._address || this._address.trim().length === 0) {
      throw new Error('Delivery address is required');
    }

    if (this._address.trim().length < 10) {
      throw new Error('Delivery address must be at least 10 characters');
    }

    if (!this._city || this._city.trim().length === 0) {
      throw new Error('Delivery city is required');
    }

    if (!this._state || this._state.trim().length === 0) {
      throw new Error('Delivery state is required');
    }
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get transactionId(): string {
    return this._transactionId;
  }

  get fullName(): string {
    return this._fullName;
  }

  get phone(): string {
    return this._phone;
  }

  get address(): string {
    return this._address;
  }

  get city(): string {
    return this._city;
  }

  get state(): string {
    return this._state;
  }

  get postalCode(): string | null {
    return this._postalCode;
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
      transactionId: this._transactionId,
      fullName: this._fullName,
      phone: this._phone,
      address: this._address,
      city: this._city,
      state: this._state,
      postalCode: this._postalCode,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * Crear desde objeto plano
   */
  static fromPrimitives(props: {
    id: string;
    transactionId: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Delivery {
    return new Delivery(props);
  }
}
