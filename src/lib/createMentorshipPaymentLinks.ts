import { stripe } from '../app/api/payments/stripe/stripeConfig';
import { coursePaymentWarn } from './coursePaymentDebug';
import { createMentorshipDlocalPaymentLink } from './mentorshipDlocalPaymentLink';
import { buildMentorshipStripeSuccessUrl } from './mentorshipPaymentUrls';
import {
  mentorshipOpcionPagoIsStale,
  resolveMentorshipPaymentOrigin,
  stripTrailingSlash,
} from './resolveMentorshipPaymentOrigin';

export type MentorshipBillingInterval = 'mensual' | 'anual' | 'trimestral';

export type MentorshipPlanPagoOption = {
  proveedor: 'stripe' | 'dlocalgo';
  etiqueta: string;
  descripcion: string;
  monto: number;
  moneda: string;
  paymentLink: string;
  activo: boolean;
  stripePriceId?: string;
  stripeProductId?: string;
  dlocalOrderId?: string;
  dlocalPaymentId?: string;
  merchantCheckoutToken?: string;
  /** Base URL con la que se generó el link (ngrok, prod, localhost). */
  originBase?: string;
};

export type MentorshipPlanPriceInput = {
  interval: MentorshipBillingInterval;
  price: number;
  currency: string;
  stripePriceId: string;
  opcionesPago?: MentorshipPlanPagoOption[];
};

type CreateIntervalPaymentsParams = {
  planId: string;
  planName: string;
  planLevel: string;
  description: string;
  price: MentorshipPlanPriceInput;
  origin: string;
  orderSuffix?: string;
};

function plainPriceEntry(entry: unknown): MentorshipPlanPriceInput | null {
  if (!entry || typeof entry !== 'object') return null;
  const record = entry as MentorshipPlanPriceInput & { toObject?: () => MentorshipPlanPriceInput };
  if (typeof record.toObject === 'function') {
    return record.toObject() as MentorshipPlanPriceInput;
  }
  return { ...record };
}

function plainPricesList(prices: unknown[] | undefined): MentorshipPlanPriceInput[] {
  return (prices || [])
    .map((entry) => plainPriceEntry(entry))
    .filter((entry): entry is MentorshipPlanPriceInput => Boolean(entry?.interval));
}

const intervalLabel = (interval: MentorshipBillingInterval) => {
  if (interval === 'mensual') return 'mensual (compromiso mínimo 3 meses)';
  if (interval === 'trimestral') return 'trimestral (cada 3 meses)';
  return 'anual';
};

const intervalProductLabel = (interval: MentorshipBillingInterval) => {
  if (interval === 'mensual') return 'Mensual';
  if (interval === 'trimestral') return 'Trimestral';
  return 'Anual';
};

export async function createStripeMentorshipPaymentLink({
  planId,
  planName,
  planLevel,
  interval,
  stripePriceId,
  origin,
}: {
  planId: string;
  planName: string;
  planLevel: string;
  interval: MentorshipBillingInterval;
  stripePriceId: string;
  origin: string;
}) {
  const successUrl = buildMentorshipStripeSuccessUrl(origin, planId, interval);

  const baseParams = {
    line_items: [{ price: stripePriceId, quantity: 1 }],
    after_completion: {
      type: 'redirect' as const,
      redirect: { url: successUrl },
    },
    metadata: {
      planId,
      planName,
      planLevel,
      interval,
      type: 'mentorship',
    },
    phone_number_collection: { enabled: true },
  };

  try {
    const paymentLink = await stripe.paymentLinks.create({
      ...baseParams,
      subscription_data: {
        metadata: {
          planId,
          planName,
          planLevel,
          interval,
          type: 'mentorship',
        },
      },
    });

    return {
      paymentLink: paymentLink.url || '',
      stripePriceId,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('subscription_data')) {
      throw error;
    }

    coursePaymentWarn('mentorship.stripe_link.retry_without_subscription_data', {
      planId,
      interval,
      message,
    });

    const paymentLink = await stripe.paymentLinks.create(baseParams);

    return {
      paymentLink: paymentLink.url || '',
      stripePriceId,
    };
  }
}

export function buildMentorshipOpcionesPago({
  interval,
  precio,
  moneda = 'USD',
  stripe,
  dlocalgo,
  originBase,
}: {
  interval: MentorshipBillingInterval;
  precio: number;
  moneda?: string;
  stripe: { paymentLink: string; stripePriceId: string };
  dlocalgo: {
    orderId?: string;
    paymentId?: string;
    paymentLink?: string;
    merchantCheckoutToken?: string;
  };
  originBase: string;
}): MentorshipPlanPagoOption[] {
  const ciclo = intervalLabel(interval);
  const normalizedOrigin = stripTrailingSlash(originBase);

  return [
    {
      proveedor: 'stripe',
      etiqueta: `Mentoría ${ciclo} — tarjeta internacional`,
      descripcion:
        interval === 'mensual'
          ? 'Suscripción mensual con compromiso mínimo de 3 meses. Tarjetas internacionales, Apple Pay y Google Pay.'
          : 'Suscripción con tarjetas internacionales, Apple Pay y Google Pay.',
      monto: precio,
      moneda,
      paymentLink: stripe.paymentLink,
      activo: Boolean(stripe.paymentLink),
      stripePriceId: stripe.stripePriceId,
      originBase: normalizedOrigin,
    },
    {
      proveedor: 'dlocalgo',
      etiqueta: `Mentoría ${ciclo} — cuotas locales`,
      descripcion: 'Pago del ciclo con tarjetas regionales y hasta 12 cuotas en moneda local.',
      monto: precio,
      moneda,
      paymentLink: dlocalgo.paymentLink || '',
      activo: Boolean(dlocalgo.paymentLink),
      dlocalOrderId: dlocalgo.orderId,
      dlocalPaymentId: dlocalgo.paymentId,
      merchantCheckoutToken: dlocalgo.merchantCheckoutToken,
      originBase: normalizedOrigin,
    },
  ];
}

export async function createMentorshipIntervalPayments({
  planId,
  planName,
  planLevel,
  description,
  price,
  origin,
  orderSuffix,
}: CreateIntervalPaymentsParams) {
  const interval = price.interval;
  const tierNombre = `${planName} (${intervalProductLabel(interval)})`;

  const stripeResult = await createStripeMentorshipPaymentLink({
    planId,
    planName,
    planLevel,
    interval,
    stripePriceId: price.stripePriceId,
    origin,
  });

  let dlocalResult: Awaited<ReturnType<typeof createMentorshipDlocalPaymentLink>> | null = null;

  try {
    dlocalResult = await createMentorshipDlocalPaymentLink({
      planId,
      interval,
      nombre: tierNombre,
      descripcion: description || tierNombre,
      precio: price.price,
      moneda: price.currency,
      origin,
      orderSuffix,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'No se pudo crear el link de dLocal GO';
    coursePaymentWarn('mentorship.create_link.dlocal.failed', {
      planId,
      interval,
      message,
    });
  }

  const paymentOrigin = stripTrailingSlash(origin);

  const opcionesPago = buildMentorshipOpcionesPago({
    interval,
    precio: price.price,
    moneda: price.currency,
    stripe: stripeResult,
    dlocalgo: {
      orderId: dlocalResult?.orderId,
      paymentId: dlocalResult?.paymentId,
      paymentLink: dlocalResult?.paymentLink,
      merchantCheckoutToken: dlocalResult?.merchantCheckoutToken,
    },
    originBase: paymentOrigin,
  });

  return {
    ...price,
    opcionesPago,
  };
}

function hasPaymentLink(
  opcionesPago: MentorshipPlanPagoOption[] | undefined,
  proveedor: 'stripe' | 'dlocalgo',
): boolean {
  return Boolean(
    opcionesPago?.find((o) => o.proveedor === proveedor && o.paymentLink?.trim()),
  );
}

function mergeOpcionesPago(
  existing: MentorshipPlanPagoOption[] | undefined,
  nuevas: MentorshipPlanPagoOption[],
): MentorshipPlanPagoOption[] {
  const merged = [...(existing || [])];

  for (const nueva of nuevas) {
    const idx = merged.findIndex((o) => o.proveedor === nueva.proveedor);
    if (idx >= 0) {
      merged[idx] = { ...merged[idx], ...nueva };
    } else {
      merged.push(nueva);
    }
  }

  return merged;
}

export async function ensureMentorshipPlanPaymentLinks(
  plan: {
    _id: { toString(): string } | string;
    name: string;
    description?: string;
    level: string;
    prices?: MentorshipPlanPriceInput[];
  },
  origin: string,
  options?: { forceRegenerate?: boolean },
): Promise<MentorshipPlanPriceInput[]> {
  const planId = typeof plan._id === 'string' ? plan._id : plan._id.toString();
  const baseUrl = stripTrailingSlash(resolveMentorshipPaymentOrigin() || origin);
  const forceRegenerate = options?.forceRegenerate ?? false;
  const prices = plainPricesList(plan.prices as unknown[]);

  if (!prices.length) return prices;

  const updatedPrices: MentorshipPlanPriceInput[] = [];

  for (const price of prices) {
    const stripeOption = price.opcionesPago?.find((o) => o.proveedor === 'stripe');
    const dlocalOption = price.opcionesPago?.find((o) => o.proveedor === 'dlocalgo');
    const staleStripe = mentorshipOpcionPagoIsStale(stripeOption, baseUrl);
    const staleDlocal = mentorshipOpcionPagoIsStale(dlocalOption, baseUrl);

    const needsStripe =
      forceRegenerate || !hasPaymentLink(price.opcionesPago, 'stripe') || staleStripe;
    const needsDlocal =
      forceRegenerate || !hasPaymentLink(price.opcionesPago, 'dlocalgo') || staleDlocal;

    if (!needsStripe && !needsDlocal) {
      updatedPrices.push(price);
      continue;
    }

    const interval = price.interval;
    const tierNombre = `${plan.name} (${intervalProductLabel(interval)})`;
    const existingStripe = price.opcionesPago?.find((o) => o.proveedor === 'stripe');
    const existingDlocal = price.opcionesPago?.find((o) => o.proveedor === 'dlocalgo');

    let stripeResult = {
      paymentLink: existingStripe?.paymentLink || '',
      stripePriceId: price.stripePriceId,
    };

    let dlocalResult: {
      orderId?: string;
      paymentId?: string;
      paymentLink?: string;
      merchantCheckoutToken?: string;
    } = {
      orderId: existingDlocal?.dlocalOrderId,
      paymentId: existingDlocal?.dlocalPaymentId,
      paymentLink: existingDlocal?.paymentLink,
      merchantCheckoutToken: existingDlocal?.merchantCheckoutToken,
    };

    if (needsStripe) {
      try {
        stripeResult = await createStripeMentorshipPaymentLink({
          planId,
          planName: plan.name,
          planLevel: plan.level,
          interval,
          stripePriceId: price.stripePriceId,
          origin: baseUrl,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'No se pudo crear el link de Stripe';
        coursePaymentWarn('mentorship.ensure.stripe.failed', {
          planId,
          interval,
          message,
        });
      }
    }

    if (needsDlocal) {
      try {
        const created = await createMentorshipDlocalPaymentLink({
          planId,
          interval,
          nombre: tierNombre,
          descripcion: plan.description || tierNombre,
          precio: price.price,
          moneda: price.currency,
          origin: baseUrl,
          orderSuffix: forceRegenerate ? Date.now().toString(36) : undefined,
        });
        dlocalResult = created;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'No se pudo crear el link de dLocal GO';
        coursePaymentWarn('mentorship.ensure.dlocal.failed', {
          planId,
          interval,
          message,
        });
      }
    }

    const nuevasOpciones = buildMentorshipOpcionesPago({
      interval,
      precio: price.price,
      moneda: price.currency,
      stripe: stripeResult,
      dlocalgo: dlocalResult,
      originBase: baseUrl,
    }).filter((opcion) => {
      if (opcion.proveedor === 'stripe') return needsStripe;
      if (opcion.proveedor === 'dlocalgo') {
        return needsDlocal && Boolean(opcion.paymentLink?.trim());
      }
      return false;
    });

    updatedPrices.push({
      ...price,
      opcionesPago: mergeOpcionesPago(price.opcionesPago, nuevasOpciones),
    });
  }

  return updatedPrices;
}
