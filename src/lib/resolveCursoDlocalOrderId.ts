const CURSO_ORDER_PREFIX = 'curso-';

/** order_id estable para la primera creación del curso. */
export function buildCursoDlocalOrderId(
  productId: string,
  suffix?: string | null
): string {
  const base = `${CURSO_ORDER_PREFIX}${productId}`;
  if (!suffix?.trim()) return base;
  return `${base}-r${suffix.trim()}`;
}

/** Extrae productId (ObjectId 24 hex) desde order_id de dLocal. */
export function resolveProductIdFromDlocalOrderId(
  orderId?: string | null
): string | null {
  if (!orderId?.startsWith(CURSO_ORDER_PREFIX)) return null;
  const rest = orderId.slice(CURSO_ORDER_PREFIX.length);
  const match = rest.match(/^([a-f0-9]{24})/i);
  return match ? match[1] : null;
}
