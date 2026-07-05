import type { NextRequest } from 'next/server';

const LOCAL_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

export function resolveRequestBrowserOrigin(req: NextRequest): string {
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
  if (host) return `${proto}://${host}`.replace(/\/$/, '');

  return 'http://localhost:3000';
}

export function resolvePublicBaseUrl(fallback?: string): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    fallback?.replace(/\/$/, '') ||
    'http://localhost:3000'
  );
}

/**
 * dLocal GO redirige al browser del pagador usando success_url.
 * En local, debe apuntar al túnel público (ngrok) si existe; si no, localhost.
 */
export function resolveMentorshipDlocalSuccessBaseUrl(browserOrigin: string): string {
  const publicBase = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '');
  const isLocal = LOCAL_ORIGIN.test(browserOrigin);

  if (isLocal && publicBase) {
    return publicBase;
  }

  return browserOrigin || publicBase || 'http://localhost:3000';
}

export function resolveMentorshipDlocalCheckoutOrigins(req: NextRequest) {
  const browserOrigin = resolveRequestBrowserOrigin(req);
  const successBaseUrl = resolveMentorshipDlocalSuccessBaseUrl(browserOrigin);
  const notificationBaseUrl = resolvePublicBaseUrl(successBaseUrl);

  return {
    browserOrigin,
    successBaseUrl,
    notificationBaseUrl,
  };
}
