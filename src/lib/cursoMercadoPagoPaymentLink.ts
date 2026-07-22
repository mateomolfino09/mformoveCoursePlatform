import mercadoPagoApi, {
  MERCADO_PAGO_MAX_INSTALLMENTS,
} from '../app/api/payments/mercadoPagoConfig';
import { buildCursoMercadoPagoExternalRef } from './resolveCursoMercadoPagoExternalRef';
import {
  buildCursoMercadoPagoSuccessUrl,
  resolveCourseMercadoPagoWebhookUrl,
} from './cursoPaymentUrls';
import { coursePaymentDebug, coursePaymentWarn } from './coursePaymentDebug';
import { resolveMercadoPagoLocalAmount } from './mercadoPagoLocalAmount';

export type CreateCursoMercadoPagoPaymentResult = {
  externalReference: string;
  preferenceId?: string;
  paymentLink?: string;
  sandboxPaymentLink?: string;
  notificationUrl: string;
  amount: number;
  currency: string;
};

export async function createCursoMercadoPagoPaymentLink({
  productId,
  nombre,
  descripcion,
  precio,
  moneda,
  origin,
  orderSuffix,
  maxInstallments = MERCADO_PAGO_MAX_INSTALLMENTS,
  payerEmail,
}: {
  productId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  moneda?: string;
  origin: string;
  orderSuffix?: string;
  maxInstallments?: number;
  payerEmail?: string;
}): Promise<CreateCursoMercadoPagoPaymentResult> {
  const notificationUrl = resolveCourseMercadoPagoWebhookUrl(origin);
  const successUrl = buildCursoMercadoPagoSuccessUrl(origin, productId);
  const base = origin.replace(/\/$/, '');
  const externalReference = buildCursoMercadoPagoExternalRef(
    productId,
    orderSuffix ?? Date.now().toString(36)
  );
  const local = await resolveMercadoPagoLocalAmount(Number(precio), moneda);
  const installments =
    maxInstallments && maxInstallments > 1
      ? maxInstallments
      : MERCADO_PAGO_MAX_INSTALLMENTS;

  coursePaymentDebug('create_link.mercadopago.request', {
    productId,
    externalReference,
    amount: local.amount,
    currency: local.currency,
    sourceAmount: local.sourceAmount,
    sourceCurrency: local.sourceCurrency,
    exchangeRate: local.exchangeRate,
    notificationUrl,
    successUrl,
    maxInstallments: installments,
  });

  try {
    const response = await mercadoPagoApi.post('/checkout/preferences', {
      items: [
        {
          id: productId,
          title: nombre.slice(0, 256),
          description: (descripcion || nombre).slice(0, 256),
          quantity: 1,
          currency_id: local.currency,
          unit_price: local.amount,
        },
      ],
      external_reference: externalReference,
      notification_url: notificationUrl,
      back_urls: {
        success: successUrl,
        failure: `${base}/pago/error?productId=${productId}&provider=mercadopago`,
        pending: successUrl,
      },
      auto_return: 'approved',
      payment_methods: {
        installments,
        default_installments: 1,
      },
      metadata: {
        productId,
        purchaseType: 'curso_one_time',
        provider: 'mercadopago',
      },
      ...(payerEmail?.trim()
        ? { payer: { email: payerEmail.trim().slice(0, 100) } }
        : {}),
    });

    const data = response.data as {
      id?: string;
      init_point?: string;
      sandbox_init_point?: string;
    };

    const paymentLink =
      process.env.NODE_ENV !== 'production' && data?.sandbox_init_point
        ? data.sandbox_init_point
        : data?.init_point || data?.sandbox_init_point;

    coursePaymentDebug('create_link.mercadopago.ok', {
      productId,
      externalReference,
      preferenceId: data?.id,
      hasInitPoint: Boolean(paymentLink),
    });

    return {
      externalReference,
      preferenceId: data?.id,
      paymentLink,
      sandboxPaymentLink: data?.sandbox_init_point,
      notificationUrl,
      amount: local.amount,
      currency: local.currency,
    };
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string; error?: string; cause?: unknown }; status?: number };
      message?: string;
    };
    const mpMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'No se pudo crear el link de Mercado Pago';

    coursePaymentWarn('create_link.mercadopago.failed', {
      productId,
      externalReference,
      message: String(mpMessage),
      status: err?.response?.status,
    });

    throw new Error(String(mpMessage));
  }
}
