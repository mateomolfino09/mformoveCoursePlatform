import type Stripe from 'stripe';

/** Secrets a probar (CLI local, payments webhook, productos/eventos). */
export function getStripeWebhookSecrets(): string[] {
  const candidates = [
    process.env.STRIPE_WEBHOOK_SECRET_PAYMENTS_STRIPE_WEBHOOK,
    process.env.STRIPE_WEBHOOK_SECRET_WEBHOOKS_STRIPE,
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_CLI_WEBHOOK_SECRET,
  ];

  return [...new Set(candidates.map((s) => s?.trim()).filter(Boolean) as string[])];
}

export function constructStripeEvent(
  stripe: Stripe,
  body: string,
  signature: string
): Stripe.Event {
  const secrets = getStripeWebhookSecrets();
  if (secrets.length === 0) {
    throw new Error(
      'Falta configurar un webhook secret (STRIPE_WEBHOOK_SECRET_PAYMENTS_STRIPE_WEBHOOK, STRIPE_WEBHOOK_SECRET_WEBHOOKS_STRIPE o STRIPE_WEBHOOK_SECRET)'
    );
  }

  let lastError: unknown;
  for (const secret of secrets) {
    try {
      return stripe.webhooks.constructEvent(body, signature, secret);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Firma de webhook inválida');
}
