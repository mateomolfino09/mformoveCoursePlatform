import type { NextRequest } from 'next/server';

const LOCAL_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(?:\/|$)/i;

export function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

export function isLocalhostOrigin(url?: string | null): boolean {
  if (!url?.trim()) return false;
  try {
    const normalized = url.startsWith('http') ? url : `http://${url}`;
    const host = new URL(normalized).hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
  } catch {
    return LOCAL_ORIGIN.test(url);
  }
}

/** Base URL para success_url / webhooks de mentoría (prioriza NEXT_PUBLIC_BASE_URL). */
export function resolveMentorshipPaymentOrigin(req?: NextRequest): string {
  const publicBase = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '');
  if (publicBase) return publicBase;

  if (req) {
    const originHeader = req.headers.get('origin')?.replace(/\/$/, '');
    if (originHeader) return originHeader;

    const referer = req.headers.get('referer');
    if (referer) {
      try {
        return new URL(referer).origin;
      } catch {
        /* ignore */
      }
    }

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    if (host) return stripTrailingSlash(`${proto}://${host}`);
  }

  if (process.env.NODE_ENV === 'production') {
    return 'https://www.mateomove.com';
  }

  return 'http://localhost:3000';
}

export type MentorshipPagoOptionLike = {
  proveedor?: string;
  paymentLink?: string;
  originBase?: string;
};

/** true si el link se generó con otra base (p. ej. localhost vs ngrok). */
export function mentorshipOpcionPagoIsStale(
  opcion: MentorshipPagoOptionLike | undefined,
  expectedBase: string,
): boolean {
  if (!opcion?.paymentLink?.trim()) return false;

  const normalizedExpected = stripTrailingSlash(expectedBase);
  const storedBase = opcion.originBase ? stripTrailingSlash(opcion.originBase) : null;

  if (storedBase) {
    return storedBase !== normalizedExpected;
  }

  // Links legacy sin originBase: regenerar si el entorno espera URL pública.
  return !isLocalhostOrigin(normalizedExpected);
}

export function mentorshipPricesHaveStaleLinks(
  prices: Array<{ opcionesPago?: MentorshipPagoOptionLike[] }> | undefined,
  expectedBase: string,
): boolean {
  if (!prices?.length) return false;
  return prices.some((price) =>
    (price.opcionesPago || []).some((opcion) =>
      mentorshipOpcionPagoIsStale(opcion, expectedBase),
    ),
  );
}
