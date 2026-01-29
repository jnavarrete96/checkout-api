export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export class Transaction {
  private readonly _id: string;
  private readonly _transactionNo: string;
  private readonly _productId: string;
  private readonly _customerId: string;
  private _status: TransactionStatus;
  private readonly _amount: number;
  private readonly _baseFee: number;
  private readonly _deliveryFee: number;
  private readonly _totalAmount: number;
  private _wompiTransactionId: string | null;
  private _wompiReference: string | null;
  private _cardBrand: string | null;
  private _cardLastFour: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: string;
    transactionNo: string;
    productId: string;
    customerId: string;
    status?: TransactionStatus;
    amount: number;
    baseFee: number;
    deliveryFee: number;
    totalAmount: number;
    wompiTransactionId?: string | null;
    wompiReference?: string | null;
    cardBrand?: string | null;
    cardLastFour?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props.id;
    this._transactionNo = props.transactionNo;
    this._productId = props.productId;
    this._customerId = props.customerId;
    this._status = props.status || 'PENDING';
    this._amount = props.amount;
    this._baseFee = props.baseFee;
    this._deliveryFee = props.deliveryFee;
    this._totalAmount = props.totalAmount;
    this._wompiTransactionId = props.wompiTransactionId || null;
    this._wompiReference = props.wompiReference || null;
    this._cardBrand = props.cardBrand || null;
    this._cardLastFour = props.cardLastFour || null;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  /**
   * Validaciones de negocio
   */
  private validate(): void {
    if (!this._transactionNo || this._transactionNo.trim().length === 0) {
      throw new Error('Transaction number is required');
    }

    if (this._amount < 0) {
      throw new Error('Transaction amount cannot be negative');
    }

    if (this._baseFee < 0) {
      throw new Error('Base fee cannot be negative');
    }

    if (this._deliveryFee < 0) {
      throw new Error('Delivery fee cannot be negative');
    }

    if (this._totalAmount < 0) {
      throw new Error('Total amount cannot be negative');
    }

    // Validar que el total sea la suma correcta
    const expectedTotal = this._amount + this._baseFee + this._deliveryFee;
    if (Math.abs(this._totalAmount - expectedTotal) > 0.01) {
      throw new Error(
        `Total amount mismatch. Expected: ${expectedTotal}, Got: ${this._totalAmount}`,
      );
    }
  }

  /**
   * Verificar si la transacción puede ser procesada
   */
  canBeProcessed(): boolean {
    return this._status === 'PENDING';
  }

  /**
   * Verificar si la transacción fue exitosa
   */
  isSuccessful(): boolean {
    return this._status === 'APPROVED';
  }

  /**
   * Verificar si la transacción falló
   */
  isFailed(): boolean {
    return this._status === 'DECLINED' || this._status === 'ERROR';
  }

  /**
   * Aprobar transacción
   */
  approve(wompiData: {
    transactionId: string;
    reference: string;
    cardBrand?: string;
    cardLastFour?: string;
  }): void {
    if (!this.canBeProcessed()) {
      throw new Error(
        `Cannot approve transaction with status: ${this._status}`,
      );
    }

    this._status = 'APPROVED';
    this._wompiTransactionId = wompiData.transactionId;
    this._wompiReference = wompiData.reference;
    this._cardBrand = wompiData.cardBrand || null;
    this._cardLastFour = wompiData.cardLastFour || null;
    this._updatedAt = new Date();
  }

  /**
   * Rechazar transacción
   */
  decline(wompiData?: { transactionId?: string; reference?: string }): void {
    if (!this.canBeProcessed()) {
      throw new Error(
        `Cannot decline transaction with status: ${this._status}`,
      );
    }

    this._status = 'DECLINED';
    if (wompiData) {
      this._wompiTransactionId = wompiData.transactionId || null;
      this._wompiReference = wompiData.reference || null;
    }

    this._updatedAt = new Date();
  }

  /**
   * Marcar como error
   */
  markAsError(wompiData?: {
    transactionId?: string;
    reference?: string;
  }): void {
    if (!this.canBeProcessed()) {
      throw new Error(
        `Cannot mark as error transaction with status: ${this._status}`,
      );
    }

    this._status = 'ERROR';

    if (wompiData) {
      this._wompiTransactionId = wompiData.transactionId || null;
      this._wompiReference = wompiData.reference || null;
    }

    this._updatedAt = new Date();
  }

  /**
   * Actualizar información de pago
   */
  updatePaymentInfo(cardBrand: string, cardLastFour: string): void {
    this._cardBrand = cardBrand;
    this._cardLastFour = cardLastFour;
    this._updatedAt = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get transactionNo(): string {
    return this._transactionNo;
  }

  get productId(): string {
    return this._productId;
  }

  get customerId(): string {
    return this._customerId;
  }

  get status(): TransactionStatus {
    return this._status;
  }

  get amount(): number {
    return this._amount;
  }

  get baseFee(): number {
    return this._baseFee;
  }

  get deliveryFee(): number {
    return this._deliveryFee;
  }

  get totalAmount(): number {
    return this._totalAmount;
  }

  get wompiTransactionId(): string | null {
    return this._wompiTransactionId;
  }

  get wompiReference(): string | null {
    return this._wompiReference;
  }

  get cardBrand(): string | null {
    return this._cardBrand;
  }

  get cardLastFour(): string | null {
    return this._cardLastFour;
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
      transactionNo: this._transactionNo,
      productId: this._productId,
      customerId: this._customerId,
      status: this._status,
      amount: this._amount,
      baseFee: this._baseFee,
      deliveryFee: this._deliveryFee,
      totalAmount: this._totalAmount,
      wompiTransactionId: this._wompiTransactionId,
      wompiReference: this._wompiReference,
      cardBrand: this._cardBrand,
      cardLastFour: this._cardLastFour,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * Crear desde objeto plano
   */
  static fromPrimitives(props: {
    id: string;
    transactionNo: string;
    productId: string;
    customerId: string;
    status?: TransactionStatus;
    amount: number;
    baseFee: number;
    deliveryFee: number;
    totalAmount: number;
    wompiTransactionId?: string | null;
    wompiReference?: string | null;
    cardBrand?: string | null;
    cardLastFour?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Transaction {
    return new Transaction(props);
  }
}
