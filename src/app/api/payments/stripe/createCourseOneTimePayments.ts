import { stripe } from './stripeConfig';
import { coursePaymentWarn } from '../../../../lib/coursePaymentDebug';
import { createCursoDlocalPaymentLink } from '../../../../lib/cursoDlocalPaymentLink';
import { resolveCloudinaryOrHttpUrl } from '../../../../lib/resolveMediaImageUrl';

type CreateCourseOneTimePaymentsParams = {
  productId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  moneda?: string;
  portadaUrl?: string;
  successUrl: string;
  origin: string;
  /** Sufijo para order_id único al regenerar links (evita "Order id is duplicated"). */
  dlocalOrderSuffix?: string;
};

const toStripeCurrency = (moneda?: string) => {
  const normalized = (moneda || 'USD').trim().toUpperCase();
  if (normalized === '$') return 'usd';
  return normalized.toLowerCase();
};

const toStripeAmount = (precio: number, moneda?: string) => {
  const currency = toStripeCurrency(moneda);
  const zeroDecimal = new Set(['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf']);
  if (zeroDecimal.has(currency)) {
    return Math.round(precio);
  }
  return Math.round(precio * 100);
};

const resolvePortadaUrl = (portadaUrl?: string) => {
  const resolved = resolveCloudinaryOrHttpUrl(portadaUrl);
  return resolved || undefined;
};

export async function createStripeCoursePaymentLink({
  productId,
  nombre,
  descripcion,
  precio,
  moneda = 'USD',
  portadaUrl,
  successUrl,
}: Omit<CreateCourseOneTimePaymentsParams, 'origin' | 'dlocalOrderSuffix'>) {
  const stripeCurrency = toStripeCurrency(moneda);
  const portadaStripeUrl = resolvePortadaUrl(portadaUrl);

  const stripeProduct = await stripe.products.create({
    name: nombre,
    description: descripcion,
    ...(portadaStripeUrl ? { images: [portadaStripeUrl] } : {}),
    metadata: {
      productId,
      purchaseType: 'curso_one_time',
    },
  });

  const stripePrice = await stripe.prices.create({
    unit_amount: toStripeAmount(precio, moneda),
    currency: stripeCurrency,
    product: stripeProduct.id,
  });

  const stripePaymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: stripePrice.id, quantity: 1 }],
    after_completion: {
      type: 'redirect',
      redirect: { url: successUrl },
    },
    metadata: {
      productId,
      purchaseType: 'curso_one_time',
    },
    customer_creation: 'always',
    phone_number_collection: { enabled: true },
  });

  return {
    productId: stripeProduct.id,
    priceId: stripePrice.id,
    paymentLink: stripePaymentLink.url,
  };
}

export async function createCourseOneTimePayments({
  productId,
  nombre,
  descripcion,
  precio,
  moneda = 'USD',
  portadaUrl,
  successUrl,
  origin,
  dlocalOrderSuffix,
}: CreateCourseOneTimePaymentsParams) {
  const stripeResult = await createStripeCoursePaymentLink({
    productId,
    nombre,
    descripcion,
    precio,
    moneda,
    portadaUrl,
    successUrl,
  });

  let dlocalResult: Awaited<ReturnType<typeof createCursoDlocalPaymentLink>> | null = null;

  try {
    dlocalResult = await createCursoDlocalPaymentLink({
      productId,
      nombre,
      descripcion,
      precio,
      moneda,
      origin,
      orderSuffix: dlocalOrderSuffix,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'No se pudo crear el link de dLocal GO';
    coursePaymentWarn('create_link.dlocal.failed', {
      productId,
      message,
    });
  }

  return {
    stripe: stripeResult,
    dlocalgo: {
      orderId: dlocalResult?.orderId,
      paymentId: dlocalResult?.paymentId,
      paymentLink: dlocalResult?.paymentLink,
      merchantCheckoutToken: dlocalResult?.merchantCheckoutToken,
    },
  };
}

export function buildCursoOpcionesPago({
  precio,
  moneda = 'USD',
  pagos,
}: {
  precio: number;
  moneda?: string;
  pagos: Awaited<ReturnType<typeof createCourseOneTimePayments>>;
}) {
  const opciones: Array<{
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
  }> = [
    {
      proveedor: 'stripe' as const,
      etiqueta: 'Empezar AHORA',
      descripcion:
        'Pago único con tarjetas internacionales, Apple Pay y Google Pay.',
      monto: precio,
      moneda,
      paymentLink: pagos.stripe.paymentLink,
      activo: Boolean(pagos.stripe.paymentLink),
      stripePriceId: pagos.stripe.priceId,
      stripeProductId: pagos.stripe.productId,
    },
  ];

  opciones.push({
    proveedor: 'dlocalgo' as const,
    etiqueta: 'Empezar AHORA (paga en cuotas)',
    descripcion: 'Pago con tarjetas regionales y hasta 12 cuotas en moneda local.',
    monto: precio,
    moneda,
    paymentLink: pagos.dlocalgo.paymentLink || '',
    activo: Boolean(pagos.dlocalgo.paymentLink),
    dlocalOrderId: pagos.dlocalgo.orderId,
    dlocalPaymentId: pagos.dlocalgo.paymentId,
    merchantCheckoutToken: pagos.dlocalgo.merchantCheckoutToken,
  });

  return opciones;
}

type PreventaTierInput = {
  etiqueta?: string;
  descripcion?: string;
  monto: number;
  moneda?: string;
  fechaFin?: string | Date | null;
  cuposLimite?: number;
  cuposUsados?: number;
  activo?: boolean;
  orden?: number;
  opcionesPago?: Array<{
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
  }>;
};

function mergePreventaOpcionesPago(
  existing: PreventaTierInput['opcionesPago'],
  nuevas: NonNullable<PreventaTierInput['opcionesPago']>
): NonNullable<PreventaTierInput['opcionesPago']> {
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

/** Genera links de pago para tiers de preventa que aún no los tienen. */
export async function generateCursoPreciosPreventaLinks({
  productId,
  nombre,
  descripcion,
  portadaUrl,
  successUrl,
  origin,
  preciosPreventa,
}: {
  productId: string;
  nombre: string;
  descripcion: string;
  portadaUrl?: string;
  successUrl: string;
  origin: string;
  preciosPreventa: PreventaTierInput[];
}) {
  if (!preciosPreventa?.length) return preciosPreventa;

  const result: PreventaTierInput[] = [];

  for (let i = 0; i < preciosPreventa.length; i++) {
    const tier = preciosPreventa[i];
    const monto = Number(tier.monto) || 0;
    const opcionesPago = tier.opcionesPago || [];
    const needsStripe = !opcionesPago.some(
      (o) => o.proveedor === 'stripe' && o.paymentLink?.trim()
    );
    const needsDlocal = !opcionesPago.some(
      (o) => o.proveedor === 'dlocalgo' && o.paymentLink?.trim()
    );

    if (monto <= 0 || (!needsStripe && !needsDlocal)) {
      result.push(tier);
      continue;
    }

    const tierNombre = `${nombre} — ${tier.etiqueta || `Preventa ${i + 1}`}`;
    const tierSuccessUrl = `${successUrl}&preventaTier=${i}`;

    const pagos: Awaited<ReturnType<typeof createCourseOneTimePayments>> = {
      stripe: { productId: '', priceId: '', paymentLink: '' },
      dlocalgo: {
        orderId: undefined,
        paymentId: undefined,
        paymentLink: undefined,
        merchantCheckoutToken: undefined,
      },
    };

    if (needsStripe) {
      pagos.stripe = await createStripeCoursePaymentLink({
        productId,
        nombre: tierNombre,
        descripcion: tier.descripcion || descripcion,
        precio: monto,
        moneda: tier.moneda,
        portadaUrl,
        successUrl: tierSuccessUrl,
      });
    }

    if (needsDlocal) {
      try {
        const dlocalResult = await createCursoDlocalPaymentLink({
          productId,
          nombre: tierNombre,
          descripcion: tier.descripcion || descripcion,
          precio: monto,
          moneda: tier.moneda,
          origin,
          orderSuffix: `preventa-${i}-${Date.now().toString(36)}`,
        });
        pagos.dlocalgo = {
          orderId: dlocalResult.orderId,
          paymentId: dlocalResult.paymentId,
          paymentLink: dlocalResult.paymentLink,
          merchantCheckoutToken: dlocalResult.merchantCheckoutToken,
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'No se pudo crear el link de dLocal GO';
        coursePaymentWarn('create_link.preventa.dlocal.failed', {
          productId,
          tierIndex: i,
          message,
        });
      }
    }

    const nuevasOpciones = buildCursoOpcionesPago({
      precio: monto,
      moneda: tier.moneda,
      pagos,
    })
      .filter((plan) => {
        if (plan.proveedor === 'stripe') return needsStripe;
        if (plan.proveedor === 'dlocalgo') {
          return needsDlocal && Boolean(plan.paymentLink?.trim());
        }
        return false;
      })
      .map((plan) => ({
        ...plan,
        etiqueta: tier.etiqueta
          ? `${tier.etiqueta} — ${plan.proveedor === 'dlocalgo' ? 'cuotas' : 'tarjeta'}`
          : plan.etiqueta,
      }));

    result.push({
      ...tier,
      opcionesPago: mergePreventaOpcionesPago(opcionesPago, nuevasOpciones),
    });
  }

  return result;
}
