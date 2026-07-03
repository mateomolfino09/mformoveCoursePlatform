import { countries } from '../constants/countries';

export type DetectedCountry = {
  countryCode: string | null;
  countryLabel: string | null;
  source: 'vercel' | 'cloudflare' | null;
};

const INVALID_CODES = new Set(['', 'XX', 'T1']);

function normalizeCountryCode(raw: string | null): string | null {
  const code = raw?.trim().toUpperCase() || '';
  if (!code || INVALID_CODES.has(code)) return null;
  return code;
}

/** País inferido desde headers de Vercel o Cloudflare (solo en servidor). */
export function resolveCountryFromHeaders(req: { headers: Headers }): DetectedCountry {
  const vercel = normalizeCountryCode(req.headers.get('x-vercel-ip-country'));
  if (vercel) {
    const entry = countries.find((c) => c.value === vercel);
    return {
      countryCode: vercel,
      countryLabel: entry?.label || null,
      source: 'vercel',
    };
  }

  const cloudflare = normalizeCountryCode(req.headers.get('cf-ipcountry'));
  if (cloudflare) {
    const entry = countries.find((c) => c.value === cloudflare);
    return {
      countryCode: cloudflare,
      countryLabel: entry?.label || null,
      source: 'cloudflare',
    };
  }

  return { countryCode: null, countryLabel: null, source: null };
}

/** Prioridad: valor explícito → geo por IP (label o código ISO). */
export function resolvePayerCountry(
  explicit?: string | null,
  req?: { headers: Headers }
): string | undefined {
  const trimmed = explicit?.trim();
  if (trimmed) return trimmed;

  if (!req) return undefined;

  const detected = resolveCountryFromHeaders(req);
  return detected.countryLabel || detected.countryCode || undefined;
}
