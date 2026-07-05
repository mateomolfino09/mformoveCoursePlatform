import { countries } from './countries';

/** Países con moneda local en dLocal Go (cuotas / checkout local). */
export const DLOCAL_COUNTRY_CURRENCY: Record<string, string> = {
  AR: 'ARS',
  BO: 'BOB',
  BR: 'BRL',
  CL: 'CLP',
  CO: 'COP',
  CR: 'CRC',
  EC: 'USD',
  GT: 'GTQ',
  MX: 'MXN',
  PE: 'PEN',
  PY: 'PYG',
  UY: 'UYU',
  MY: 'MYR',
  ID: 'IDR',
  KE: 'KES',
  NG: 'NGN',
};

const PRIORITY_ORDER = ['UY', 'AR', 'MX', 'CL', 'CO', 'BR', 'PE', 'PY', 'BO', 'EC', 'CR', 'GT'];

/** Países para registro / checkout dLocal (solo los que aceptan moneda local). */
export const dlocalCountries = PRIORITY_ORDER.map((code) =>
  countries.find((c) => c.value === code)
)
  .filter((c): c is (typeof countries)[number] => Boolean(c))
  .concat(
    countries.filter(
      (c) =>
        DLOCAL_COUNTRY_CURRENCY[c.value] &&
        !PRIORITY_ORDER.includes(c.value)
    )
  );

export function isDlocalLocalCurrencyCountry(country?: string | null): boolean {
  if (!country?.trim()) return false;
  const code =
    country.length === 2
      ? country.toUpperCase()
      : countries.find((c) => c.label.toLowerCase() === country.trim().toLowerCase())?.value;
  return Boolean(code && DLOCAL_COUNTRY_CURRENCY[code]);
}
