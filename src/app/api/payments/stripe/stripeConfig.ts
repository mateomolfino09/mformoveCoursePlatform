import Stripe from 'stripe';

const STRIPE_API_VERSION = '2025-02-24.acacia' as const;

let stripeClient: Stripe | null = null;

function createStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY no está configurada. Agregala en .env / .env.local y reiniciá el servidor.',
    );
  }
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
}

/** Cliente Stripe lazy: no falla al importar el módulo si falta la key. */
export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = createStripeClient();
  }
  return stripeClient;
}

/**
 * Compatible con `import { stripe } from '...stripeConfig'`.
 * Diferís la validación de la API key hasta el primer uso real.
 */
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const client = getStripe();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === 'function' ? (value as Function).bind(client) : value;
  },
});
