/**
 * Mercado Pago a veces normaliza keys de metadata a snake_case.
 * Leemos camelCase y snake_case.
 */
export function getMercadoPagoMetadataValue(
  metadata: Record<string, unknown> | null | undefined,
  camelKey: string
): string | undefined {
  if (!metadata || typeof metadata !== 'object') return undefined;

  const snakeKey = camelKey.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
  const raw = metadata[camelKey] ?? metadata[snakeKey];
  if (raw == null) return undefined;
  const value = String(raw).trim();
  return value || undefined;
}

export function getMercadoPagoMetadataNumber(
  metadata: Record<string, unknown> | null | undefined,
  camelKey: string
): number | undefined {
  if (!metadata || typeof metadata !== 'object') return undefined;
  const snakeKey = camelKey.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
  const raw = metadata[camelKey] ?? metadata[snakeKey];
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim() && !Number.isNaN(Number(raw))) {
    return Number(raw);
  }
  return undefined;
}
