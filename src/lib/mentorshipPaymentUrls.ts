const stripTrailingSlash = (url: string) => url.replace(/\/$/, '');

export function buildMentorshipStripeSuccessUrl(
  baseUrl: string,
  planId: string,
  interval: string,
): string {
  const base = stripTrailingSlash(baseUrl);
  return `${base}/mentoria/exito?plan_id=${planId}&interval=${interval}&provider=stripe&session_id={CHECKOUT_SESSION_ID}`;
}

export function buildMentorshipDlocalSuccessUrl(
  baseUrl: string,
  planId: string,
  interval: string,
  options?: { userId?: string; orderId?: string },
): string {
  const base = stripTrailingSlash(baseUrl);
  const params = new URLSearchParams({
    plan_id: planId,
    interval,
    provider: 'dlocalgo',
  });
  if (options?.userId?.trim()) {
    params.set('external_id', options.userId.trim());
  }
  if (options?.orderId?.trim()) {
    params.set('order_id', options.orderId.trim());
  }
  const query = params.toString();
  let url = `${base}/mentoria/exito?${query}`;

  if (base.includes('ngrok')) {
    url += '&ngrok-skip-browser-warning=1';
  }

  return url;
}

export function resolveMentorshipDlocalWebhookUrl(origin?: string): string {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    origin?.replace(/\/$/, '') ||
    'http://localhost:3000';
  return `${base}/api/payments/mentorship/dlocalWebhook`;
}

export function buildMentorshipMercadoPagoSuccessUrl(
  baseUrl: string,
  planId: string,
  interval: string,
  options?: { userId?: string; externalRef?: string },
): string {
  const base = stripTrailingSlash(baseUrl);
  const params = new URLSearchParams({
    plan_id: planId,
    interval,
    provider: 'mercadopago',
  });
  if (options?.userId?.trim()) {
    params.set('external_id', options.userId.trim());
  }
  if (options?.externalRef?.trim()) {
    params.set('external_reference', options.externalRef.trim());
  }
  return `${base}/mentoria/exito?${params.toString()}`;
}

export function resolveMentorshipMercadoPagoWebhookUrl(origin?: string): string {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    origin?.replace(/\/$/, '') ||
    'http://localhost:3000';
  return `${base}/api/payments/mentorship/mercadoPagoWebhook`;
}
