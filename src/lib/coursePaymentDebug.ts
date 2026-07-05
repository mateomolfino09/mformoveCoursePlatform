const LOG_PREFIX = '[course-payment]';

/** Activo con DEBUG_COURSE_PAYMENTS=true o fuera de production. */
export function isCoursePaymentDebugEnabled(): boolean {
  if (process.env.DEBUG_COURSE_PAYMENTS === 'true') return true;
  if (process.env.DEBUG_COURSE_PAYMENTS === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}

function maskEmail(email?: string | null): string | undefined {
  if (!email?.trim()) return undefined;
  const normalized = email.trim().toLowerCase();
  const at = normalized.indexOf('@');
  if (at <= 0) return '***';
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

function sanitizePayload(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...data };
  for (const key of ['email', 'payerEmail', 'customerEmail'] as const) {
    if (key in out && typeof out[key] === 'string') {
      out[key] = maskEmail(out[key] as string);
    }
  }
  return out;
}

export function coursePaymentDebug(
  step: string,
  data?: Record<string, unknown>
): void {
  if (!isCoursePaymentDebugEnabled()) return;
  if (data) {
    console.log(LOG_PREFIX, step, sanitizePayload(data));
  } else {
    console.log(LOG_PREFIX, step);
  }
}

export function coursePaymentWarn(
  step: string,
  data?: Record<string, unknown>
): void {
  if (!isCoursePaymentDebugEnabled()) return;
  if (data) {
    console.warn(LOG_PREFIX, step, sanitizePayload(data));
  } else {
    console.warn(LOG_PREFIX, step);
  }
}

export function coursePaymentError(
  step: string,
  error: unknown,
  data?: Record<string, unknown>
): void {
  const message = error instanceof Error ? error.message : String(error);
  const payload = data ? sanitizePayload(data) : undefined;
  console.error(LOG_PREFIX, step, { error: message, ...payload });
}

/** URL pública del webhook de curso dLocal (para logs al crear links). */
export function resolveCourseDlocalWebhookUrl(origin?: string): string {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    origin?.replace(/\/$/, '') ||
    'http://localhost:3000';
  return `${base}/api/payments/course/dlocalWebhook`;
}
