export class Product {
  private readonly _id: string;
  private _name: string;
  private _description: string | null;
  private _price: number;
  private _stockQuantity: number;
  private _imageUrl: string | null;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    stockQuantity: number;
    imageUrl?: string | null;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props.id;
    this._name = props.name;
    this._description = props.description || null;
    this._price = props.price;
    this._stockQuantity = props.stockQuantity;
    this._imageUrl = props.imageUrl || null;
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  /**
   * Validaciones de negocio
   */
  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('Product name is required');
    }

    if (this._price < 0) {
      throw new Error('Product price cannot be negative');
    }

    if (this._stockQuantity < 0) {
      throw new Error('Product stock quantity cannot be negative');
    }
  }

  /**
   * Verificar si el producto está disponible para compra
   */
  isAvailable(): boolean {
    return this._isActive && this._stockQuantity > 0;
  }

  /**
   * Verificar si hay suficiente stock
   */
  hasStock(quantity: number): boolean {
    return this._stockQuantity >= quantity;
  }

  /**
   * Decrementar stock (cuando se realiza una compra)
   */
  decreaseStock(quantity: number = 1): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (!this.hasStock(quantity)) {
      throw new Error(
        `Insufficient stock. Available: ${this._stockQuantity}, Requested: ${quantity}0`,
      );
    }

    this._stockQuantity -= quantity;
    this._updatedAt = new Date();
  }

  /**
   * Incrementar stock (restock, devoluciones)
   */
  increaseStock(quantity: number = 1): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    this._stockQuantity += quantity;
    this._updatedAt = new Date();
  }

  /**
   * Activar producto
   */
  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Desactivar producto
   */
  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  /**
   * Actualizar información del producto
   */
  updateInfo(props: {
    name?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
  }): void {
    if (props.name !== undefined && props.name.trim().length > 0) {
      this._name = props.name;
    }

    if (props.description !== undefined) {
      this._description = props.description;
    }

    if (props.price !== undefined && props.price >= 0) {
      this._price = props.price;
    }

    if (props.imageUrl !== undefined) {
      this._imageUrl = props.imageUrl;
    }

    this._updatedAt = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get price(): number {
    return this._price;
  }

  get stockQuantity(): number {
    return this._stockQuantity;
  }

  get imageUrl(): string | null {
    return this._imageUrl;
  }

  get isActive(): boolean {
    return this._isActive;
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
      name: this._name,
      description: this._description,
      price: this._price,
      stockQuantity: this._stockQuantity,
      imageUrl: this._imageUrl,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * Crear desde objeto plano
   */
  static fromPrimitives(props: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    stockQuantity: number;
    imageUrl?: string | null;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): Product {
    return new Product(props);
  }
}
