/**
 * Wompi Types - Infrastructure Layer

 * Tipos específicos para la integración con Wompi API
 */

// ==========================================
// REQUEST TYPES (lo que enviamos a Wompi)
// ==========================================

export interface WompiTokenizeCardRequest {
  number: string; // Número de tarjeta sin espacios
  exp_month: string; // Mes expiración (2 dígitos: "01" - "12")
  exp_year: string; // Año expiración (2 dígitos: "28" para 2028)
  cvc: string; // Código seguridad (3-4 dígitos)
  card_holder: string; // Nombre del tarjetahabiente
}

export interface WompiCreateTransactionRequest {
  acceptance_token?: string; // Opcional en sandbox
  amount_in_cents: number; // Monto en centavos (4515000 = 45,150 COP)
  currency: string; // "COP"
  customer_email: string; // Email del cliente
  reference: string; // Referencia única (tu transaction_no)
  payment_method: {
    type: 'CARD';
    token: string; // Token obtenido de POST /tokens/cards
    installments: number; // Número de cuotas (1 = pago único)
  };
}

// ==========================================
// RESPONSE TYPES (lo que recibimos de Wompi)
// ==========================================

export interface WompiTokenizeCardResponse {
  status: string; // "CREATED"
  data: {
    id: string; // Token: "tok_test_24597_..."
    created_at: string; // ISO date
    brand: string; // "VISA", "MASTERCARD"
    name: string; // "VISA-4242"
    last_four: string; // "4242"
    bin: string; // "424242"
    exp_year: string; // "28"
    exp_month: string; // "12"
    card_holder: string; // "Juan Perez"
    expires_at: string; // ISO date
  };
}

export interface WompiTransactionResponse {
  data: {
    id: string; // ID transacción: "11854-1728506262-27959"
    created_at: string; // ISO date
    amount_in_cents: number; // 451500000
    reference: string; // Tu transaction_no
    currency: string; // "COP"
    payment_method_type: string; // "CARD"
    payment_method: {
      type: string;
      extra: {
        name: string; // "VISA-4242"
        brand: string; // "VISA"
        last_four: string; // "4242"
        card_type: string; // "CREDIT" | "DEBIT"
      };
      installments: number;
    };
    status: WompiTransactionStatus; // "PENDING", "APPROVED", "DECLINED", "ERROR"
    status_message: string | null;
    merchant: {
      name: string;
      legal_name: string;
      contact_name: string;
      phone_number: string;
      logo_url: string | null;
      legal_id_type: string;
      email: string;
      legal_id: string;
    };
  };
}

export interface WompiTransactionStatusResponse {
  data: {
    id: string;
    status: WompiTransactionStatus;
    status_message: string | null;
    payment_method: {
      extra: {
        brand: string;
        last_four: string;
      };
    };
    reference: string;
  };
}

// ==========================================
// ENUMS
// ==========================================

export type WompiTransactionStatus =
  | 'PENDING' // Procesando
  | 'APPROVED' // Aprobada
  | 'DECLINED' // Rechazada
  | 'ERROR' // Error técnico
  | 'VOIDED'; // Anulada

// ==========================================
// ERROR TYPES
// ==========================================

export interface WompiErrorResponse {
  error: {
    type: string;
    messages: {
      [key: string]: string[];
    };
  };
}
