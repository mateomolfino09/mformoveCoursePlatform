/**
 * Extrae y humaniza errores de la API de Mercado Pago (axios / fetch).
 */

type MpCause = {
  code?: string | number;
  description?: string;
  message?: string;
  data?: string;
};

type MpErrorBody = {
  message?: string;
  error?: string;
  status?: number;
  cause?: MpCause[] | MpCause | string;
};

function causeList(cause: MpErrorBody['cause']): MpCause[] {
  if (!cause) return [];
  if (Array.isArray(cause)) return cause;
  if (typeof cause === 'string') return [{ description: cause }];
  return [cause];
}

function rawMercadoPagoMessage(data: unknown, fallback: string): string {
  if (!data) return fallback;
  if (typeof data === 'string' && data.trim()) return data;

  const body = data as MpErrorBody;
  const causes = causeList(body.cause);
  const fromCause = causes
    .map((c) => c.description || c.message || c.data)
    .filter(Boolean)
    .join('. ');

  return (
    (typeof body.message === 'string' && body.message.trim()) ||
    (typeof body.error === 'string' && body.error.trim()) ||
    fromCause ||
    fallback
  );
}

/** Mensajes técnicos de MP → copy usable para el usuario. */
export function humanizeMercadoPagoMessage(raw: string): string {
  const msg = raw.trim();
  const lower = msg.toLowerCase();

  if (lower.includes('currency_id')) {
    return 'Hubo un problema al procesar la moneda del pago. Probá de nuevo en unos segundos.';
  }
  if (lower.includes('invalid_token') || lower.includes('cannot infer Payment Method')) {
    return 'No se pudo validar la tarjeta. Revisá los datos e intentá de nuevo.';
  }
  if (lower.includes('bin') || lower.includes('payment_method')) {
    return 'Esa tarjeta no está disponible para este cobro. Probá con otra.';
  }
  if (lower.includes('insufficient') || lower.includes('fund')) {
    return 'Fondos insuficientes o tarjeta rechazada. Probá con otro medio.';
  }
  if (lower.includes('unauthorized') || lower.includes('invalid access token')) {
    return 'Error de configuración de Mercado Pago. Revisá las credenciales.';
  }
  if (lower.includes('idempotency')) {
    return 'Este pago ya se estaba procesando. Esperá un momento y revisá tu estado.';
  }

  // status_detail de tarjetas
  if (lower.includes('cc_rejected_other_reason')) {
    return 'La tarjeta fue rechazada. En pruebas usá titular APRO, CI 12345678 y un email distinto al de tu cuenta Mercado Pago.';
  }
  if (lower.includes('cc_rejected_insufficient_amount') || lower.includes('cc_rejected_insufficient')) {
    return 'Fondos insuficientes. Probá con otra tarjeta.';
  }
  if (lower.includes('cc_rejected_bad_filled_security_code') || lower.includes('cc_rejected_bad_filled_card_number')) {
    return 'Datos de la tarjeta incorrectos. Revisá número, vencimiento y CVV.';
  }
  if (lower.includes('cc_rejected_bad_filled_date')) {
    return 'La fecha de vencimiento no es válida.';
  }
  if (lower.includes('cc_rejected_call_for_authorize')) {
    return 'La tarjeta requiere autorización del banco.';
  }
  if (lower.includes('cc_rejected_duplicated_payment')) {
    return 'Pago duplicado. Esperá un momento antes de reintentar.';
  }
  if (lower.includes('cc_rejected_high_risk')) {
    return 'El pago fue rechazado por seguridad. Probá con otro medio.';
  }
  if (lower.includes('cc_rejected_max_attempts')) {
    return 'Se superó el límite de intentos con esta tarjeta.';
  }
  if (lower.includes('cc_rejected')) {
    return 'La tarjeta rechazó el pago. Revisá los datos o probá con otra.';
  }

  // Si viene en inglés técnico, devolver fallback genérico más claro
  if (/the name of the following parameters is wrong/i.test(msg)) {
    return 'Mercado Pago rechazó un dato del pago. Probá de nuevo o con otra tarjeta.';
  }

  return msg || 'No se pudo procesar el pago con Mercado Pago.';
}

export function messageFromMercadoPagoStatusDetail(
  statusDetail?: string | null,
  fallback = 'El pago no fue aprobado'
): string {
  if (!statusDetail?.trim()) return fallback;
  return humanizeMercadoPagoMessage(statusDetail);
}

export function getMercadoPagoApiErrorMessage(
  error: unknown,
  fallback = 'No se pudo procesar el pago con Mercado Pago.'
): string {
  const err = error as {
    response?: { data?: unknown; status?: number };
    message?: string;
  };

  const raw = rawMercadoPagoMessage(
    err?.response?.data,
    err?.message?.trim() || fallback
  );
  return humanizeMercadoPagoMessage(raw);
}

export function getMercadoPagoApiStatus(error: unknown, fallback = 502): number {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (typeof status === 'number' && status >= 400 && status < 600) return status;
  return fallback;
}
