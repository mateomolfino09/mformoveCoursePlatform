export function normalizeDlocalPaymentId(raw?: string | null): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;
  if (value.toUpperCase().startsWith('DP-')) return value;
  return `DP-${value}`;
}
