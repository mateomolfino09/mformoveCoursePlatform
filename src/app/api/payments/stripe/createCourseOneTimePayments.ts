import dLocalApi from '../dlocalConfig';
import { isDlocalGoEnabled } from '../../../../lib/dlocalGo';
import { stripe } from './stripeConfig';

type CreateCourseOneTimePaymentsParams = {
  productId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  moneda?: string;
  portadaUrl?: string;
  successUrl: string;
  origin: string;
};

const toStripeCurrency = (moneda?: string) => {
  const normalized = (moneda || 'USD').trim().toUpperCase();
  if (normalized === '$') return 'usd';
  return normalized.toLowerCase();
};

const toDlocalCurrency = (moneda?: string) => toStripeCurrency(moneda).toUpperCase();

const toStripeAmount = (precio: number, moneda?: string) => {
  const currency = toStripeCurrency(moneda);
  const zeroDecimal = new Set(['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf']);
  if (zeroDecimal.has(currency)) {
    return Math.round(precio);
  }
  return Math.round(precio * 100);
};

const resolvePortadaUrl = (portadaUrl?: string) => {
  if (!portadaUrl) return undefined;
  if (portadaUrl.startsWith('http')) return portadaUrl;
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${portadaUrl}.jpg`;
};

export async function createCourseOneTimePayments({
  productId,
  nombre,
  descripcion,
  precio,
  moneda = 'USD',
  portadaUrl,
  successUrl,
  origin,
}: CreateCourseOneTimePaymentsParams) {
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

  const orderId = `curso-${productId}`;
  let dlocalData: {
    id?: string;
    redirect_url?: string;
    merchant_checkout_token?: string;
  } | null = null;

  if (isDlocalGoEnabled()) {
    try {
      const dlocalResponse = await dLocalApi.post('/payments', {
        name: nombre,
        currency: toDlocalCurrency(moneda),
        amount: Number(precio),
        order_id: orderId,
        description: descripcion?.slice(0, 200) || nombre,
        success_url: `${successUrl}&provider=dlocalgo`,
        back_url: `${origin}/pago/atras?productId=${productId}`,
        notification_url: `${origin}/api/payments/course/dlocalWebhook`,
        error_url: `${origin}/pago/error?productId=${productId}`,
      });
      dlocalData = dlocalResponse.data;
    } catch (error: any) {
      const dlocalMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'No se pudo crear el link de dLocal GO';
      console.warn('[createCourseOneTimePayments] dLocal GO no disponible:', dlocalMessage);
    }
  }

  return {
    stripe: {
      productId: stripeProduct.id,
      priceId: stripePrice.id,
      paymentLink: stripePaymentLink.url,
    },
    dlocalgo: {
      orderId,
      paymentId: dlocalData?.id,
      paymentLink: dlocalData?.redirect_url,
      merchantCheckoutToken: dlocalData?.merchant_checkout_token,
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
    descripcion: 'Pago con tarjetas regionales y hasta 12cuotas en moneda local.',
    monto: precio,
    moneda,
    paymentLink: pagos.dlocalgo.paymentLink || '',
    activo: Boolean(isDlocalGoEnabled() && pagos.dlocalgo.paymentLink),
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
    const hasLinks = (tier.opcionesPago || []).some((o) => o.paymentLink);

    if (monto <= 0 || hasLinks) {
      result.push(tier);
      continue;
    }

    const pagos = await createCourseOneTimePayments({
      productId,
      nombre: `${nombre} — ${tier.etiqueta || `Preventa ${i + 1}`}`,
      descripcion: tier.descripcion || descripcion,
      precio: monto,
      moneda: tier.moneda,
      portadaUrl,
      successUrl: `${successUrl}&preventaTier=${i}`,
      origin,
    });

    result.push({
      ...tier,
      opcionesPago: buildCursoOpcionesPago({
        precio: monto,
        moneda: tier.moneda,
        pagos,
      }).map((plan) => ({
        ...plan,
        etiqueta: tier.etiqueta
          ? `${tier.etiqueta} — ${plan.proveedor === 'dlocalgo' ? 'cuotas' : 'tarjeta'}`
          : plan.etiqueta,
      })),
    });
  }

  return result;
}
