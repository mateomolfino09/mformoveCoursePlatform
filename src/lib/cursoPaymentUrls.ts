const stripTrailingSlash = (url: string) => url.replace(/\/$/, '');

/** Redirect post-pago Stripe (Payment Link reemplaza {CHECKOUT_SESSION_ID}). */
export function buildCursoStripeSuccessUrl(baseUrl: string, productId: string): string {
  return `${stripTrailingSlash(baseUrl)}/pago/exito?productId=${productId}&tipo=curso&session_id={CHECKOUT_SESSION_ID}`;
}

/** Redirect post-pago dLocal GO (sin placeholder de Stripe). */
export function buildCursoDlocalSuccessUrl(baseUrl: string, productId: string): string {
  return `${stripTrailingSlash(baseUrl)}/pago/exito?productId=${productId}&tipo=curso&provider=dlocalgo`;
}

/** Redirect post-pago Mercado Pago. */
export function buildCursoMercadoPagoSuccessUrl(baseUrl: string, productId: string): string {
  return `${stripTrailingSlash(baseUrl)}/pago/exito?productId=${productId}&tipo=curso&provider=mercadopago`;
}

export function resolveCourseMercadoPagoWebhookUrl(origin?: string): string {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    origin?.replace(/\/$/, '') ||
    'http://localhost:3000';
  return `${base}/api/payments/course/mercadoPagoWebhook`;
}

/** URL de bienvenida post-compra (onboarding obligatorio). */
export function buildCursoBienvenidaSuccessUrl(baseUrl: string, productId: string): string {
  return `${stripTrailingSlash(baseUrl)}/pago/exito?productId=${productId}&tipo=curso`;
}

export const STRIPE_CHECKOUT_SESSION_PLACEHOLDER = '{CHECKOUT_SESSION_ID}';
