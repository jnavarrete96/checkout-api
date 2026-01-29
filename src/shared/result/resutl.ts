/**
 * Manejo de casos de éxito y errores sin usar try-catch excesivamente.
 */

export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _value?: T;
  private readonly _error?: string;

  private constructor(isSuccess: boolean, error?: string, value?: T) {
    if (isSuccess && error) {
      throw new Error(
        'InvalidOperation: A result cannot be successful and contain an error',
      );
    }
    if (!isSuccess && !error) {
      throw new Error(
        'InvalidOperation: A failing result needs to contain an error message',
      );
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._error = error;
    this._value = value;

    Object.freeze(this);
  }

  /**
   * Obtener el valor (solo si es exitoso)
   */
  public get value(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot retrieve value from a failed result');
    }

    return this._value as T;
  }

  /**
   * Obtener el error (solo si falló)
   */
  public get error(): string {
    if (this.isSuccess) {
      throw new Error('Cannot retrieve error from a successful result');
    }

    return this._error as string;
  }

  /**
   * Crear un resultado exitoso
   */
  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  /**
   * Crear un resultado fallido
   */
  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }

  /**
   * Combinar múltiples resultados
   * Si alguno falla, retorna el primer error
   */
  public static combine(results: Result<any>[]): Result<any> {
    for (const result of results) {
      if (result.isFailure) {
        return result;
      }
    }
    return Result.ok();
  }
}
