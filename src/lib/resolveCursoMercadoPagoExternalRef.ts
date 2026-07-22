const CURSO_MP_PREFIX = 'curso-mp-';

/** external_reference estable para preferencias de curso. */
export function buildCursoMercadoPagoExternalRef(
  productId: string,
  suffix?: string | null
): string {
  const base = `${CURSO_MP_PREFIX}${productId}`;
  if (!suffix?.trim()) return base;
  return `${base}-r${suffix.trim()}`;
}

/** Extrae productId (ObjectId 24 hex) desde external_reference de Mercado Pago. */
export function resolveProductIdFromMercadoPagoExternalRef(
  externalReference?: string | null
): string | null {
  if (!externalReference?.startsWith(CURSO_MP_PREFIX)) return null;
  const rest = externalReference.slice(CURSO_MP_PREFIX.length);
  const match = rest.match(/^([a-f0-9]{24})/i);
  return match ? match[1] : null;
}
