import { countries } from '../constants/countries';
import { DLOCAL_COUNTRY_CURRENCY } from '../constants/dlocalCountries';

const COUNTRY_NAME_ALIASES: Record<string, string> = {
  uruguay: 'UY',
  uy: 'UY',
  argentina: 'AR',
  ar: 'AR',
  brasil: 'BR',
  brazil: 'BR',
  br: 'BR',
  chile: 'CL',
  cl: 'CL',
  colombia: 'CO',
  co: 'CO',
  mexico: 'MX',
  méxico: 'MX',
  mx: 'MX',
  peru: 'PE',
  perú: 'PE',
  pe: 'PE',
  paraguay: 'PY',
  py: 'PY',
  ecuador: 'EC',
  ec: 'EC',
  bolivia: 'BO',
  bo: 'BO',
  'costa rica': 'CR',
  cr: 'CR',
  guatemala: 'GT',
  gt: 'GT',
};

const FALLBACK_USD_RATES: Record<string, number> = {
  UYU: 42,
  ARS: 1100,
  BRL: 5.5,
  CLP: 950,
  COP: 4200,
  MXN: 18,
  PEN: 3.7,
  PYG: 7800,
  BOB: 6.9,
  CRC: 520,
  GTQ: 7.8,
  MYR: 4.7,
  IDR: 16000,
  KES: 130,
  NGN: 1600,
  USD: 1,
};

const INTEGER_CURRENCIES = new Set(['UYU', 'ARS', 'CLP', 'COP', 'PYG', 'KES', 'NGN', 'IDR']);

export type DlocalLocalizedAmount = {
  amount: number;
  currency: string;
  countryCode: string | null;
  sourceAmount?: number;
  sourceCurrency?: string;
  exchangeRate?: number;
  localized: boolean;
};

export function resolveCountryCode(input?: string | null): string | null {
  const raw = input?.trim();
  if (!raw) return null;

  if (/^[A-Za-z]{2}$/.test(raw)) {
    return raw.toUpperCase();
  }

  const fromList = countries.find((c) => c.label.toLowerCase() === raw.toLowerCase());
  if (fromList) return fromList.value;

  return COUNTRY_NAME_ALIASES[raw.toLowerCase()] || null;
}

export function resolveDlocalCurrencyForCountry(country?: string | null): {
  countryCode: string | null;
  currency: string;
} {
  const countryCode = resolveCountryCode(country);
  if (!countryCode) {
    return { countryCode: null, currency: 'USD' };
  }
  return {
    countryCode,
    currency: DLOCAL_COUNTRY_CURRENCY[countryCode] || 'USD',
  };
}

function roundForCurrency(amount: number, currency: string): number {
  if (INTEGER_CURRENCIES.has(currency)) return Math.round(amount);
  return Math.round(amount * 100) / 100;
}

async function fetchUsdToCurrencyRate(targetCurrency: string): Promise<number> {
  if (targetCurrency === 'USD') return 1;

  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      const data = (await response.json()) as { rates?: Record<string, number> };
      const rate = data.rates?.[targetCurrency];
      if (typeof rate === 'number' && rate > 0) return rate;
    }
  } catch {
    /* fallback below */
  }

  return FALLBACK_USD_RATES[targetCurrency] || 1;
}

/**
 * Convierte el monto del curso a moneda local del pagador para dLocal Go.
 * Si el país no tiene moneda local en dLocal, mantiene la moneda original.
 */
export async function resolveDlocalLocalizedAmount({
  amount,
  sourceCurrency,
  country,
}: {
  amount: number;
  sourceCurrency: string;
  country?: string | null;
}): Promise<DlocalLocalizedAmount> {
  const source = (sourceCurrency || 'USD').trim().toUpperCase();
  const { countryCode, currency: targetCurrency } = resolveDlocalCurrencyForCountry(country);

  if (!countryCode || targetCurrency === source) {
    return {
      amount,
      currency: source,
      countryCode,
      localized: false,
    };
  }

  if (source === 'USD' && targetCurrency !== 'USD') {
    const rate = await fetchUsdToCurrencyRate(targetCurrency);
    return {
      amount: roundForCurrency(amount * rate, targetCurrency),
      currency: targetCurrency,
      countryCode,
      sourceAmount: amount,
      sourceCurrency: source,
      exchangeRate: rate,
      localized: true,
    };
  }

  return {
    amount,
    currency: source,
    countryCode,
    localized: false,
  };
}
