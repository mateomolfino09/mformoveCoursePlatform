/**
 * Mercado Pago MLU (Uruguay) procesa tarjetas en UYU.
 * Preferencias/Bricks en USD hacen fallar el BIN ("tarjeta no encontrada").
 */

const FALLBACK_USD_UYU = 42;

async function fetchUsdToUyuRate(): Promise<number> {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      headers: { 'User-Agent': 'mformove-mp' },
    });
    if (!res.ok) return FALLBACK_USD_UYU;
    const data = (await res.json()) as { rates?: { UYU?: number } };
    const rate = data.rates?.UYU;
    return typeof rate === 'number' && rate > 0 ? rate : FALLBACK_USD_UYU;
  } catch {
    return FALLBACK_USD_UYU;
  }
}

export type MercadoPagoLocalAmount = {
  amount: number;
  currency: 'UYU';
  sourceAmount: number;
  sourceCurrency: string;
  exchangeRate: number;
};

/** Convierte montos a UYU para la cuenta Mercado Pago de Uruguay (MLU). */
export async function resolveMercadoPagoLocalAmount(
  precio: number,
  moneda?: string | null
): Promise<MercadoPagoLocalAmount> {
  const sourceCurrency = (moneda || 'USD').trim().toUpperCase().replace('$', 'USD') || 'USD';
  const sourceAmount = Number(precio);

  if (!sourceAmount || sourceAmount <= 0) {
    throw new Error('Monto inválido para Mercado Pago');
  }

  if (sourceCurrency === 'UYU') {
    return {
      amount: Math.round(sourceAmount),
      currency: 'UYU',
      sourceAmount,
      sourceCurrency,
      exchangeRate: 1,
    };
  }

  if (sourceCurrency === 'USD') {
    const exchangeRate = await fetchUsdToUyuRate();
    return {
      amount: Math.round(sourceAmount * exchangeRate),
      currency: 'UYU',
      sourceAmount,
      sourceCurrency,
      exchangeRate,
    };
  }

  // Otras monedas: tratar como USD si no hay FX específico (evita mandar ARS/etc. a MLU)
  const exchangeRate = await fetchUsdToUyuRate();
  return {
    amount: Math.round(sourceAmount * exchangeRate),
    currency: 'UYU',
    sourceAmount,
    sourceCurrency,
    exchangeRate,
  };
}
