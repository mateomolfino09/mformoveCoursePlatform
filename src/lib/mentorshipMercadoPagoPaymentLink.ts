import mercadoPagoApi, {
  MERCADO_PAGO_MAX_INSTALLMENTS,
} from '../app/api/payments/mercadoPagoConfig';
import { buildMentorshipMercadoPagoExternalRef } from './resolveMentorshipMercadoPagoExternalRef';
import {
  buildMentorshipMercadoPagoSuccessUrl,
  resolveMentorshipMercadoPagoWebhookUrl,
} from './mentorshipPaymentUrls';
import { coursePaymentDebug, coursePaymentWarn } from './coursePaymentDebug';
import { resolveMercadoPagoLocalAmount } from './mercadoPagoLocalAmount';

export type CreateMentorshipMercadoPagoPaymentResult = {
  externalReference: string;
  preferenceId?: string;
  paymentLink?: string;
  sandboxPaymentLink?: string;
  notificationUrl: string;
  amount: number;
  currency: string;
};

export async function createMentorshipMercadoPagoPaymentLink({
  planId,
  interval,
  nombre,
  descripcion,
  precio,
  moneda,
  origin,
  notificationOrigin,
  orderSuffix,
  maxInstallments = MERCADO_PAGO_MAX_INSTALLMENTS,
  userId,
  payerEmail,
}: {
  planId: string;
  interval: string;
  nombre: string;
  descripcion: string;
  precio: number;
  moneda?: string;
  origin: string;
  notificationOrigin?: string;
  orderSuffix?: string;
  maxInstallments?: number;
  userId?: string;
  payerEmail?: string;
}): Promise<CreateMentorshipMercadoPagoPaymentResult> {
  const webhookBase = notificationOrigin || origin;
  const notificationUrl = resolveMentorshipMercadoPagoWebhookUrl(webhookBase);
  const checkoutBase = origin.replace(/\/$/, '');
  const externalReference = buildMentorshipMercadoPagoExternalRef(
    planId,
    interval,
    orderSuffix ?? Date.now().toString(36)
  );
  const local = await resolveMercadoPagoLocalAmount(Number(precio), moneda);
  const installments =
    maxInstallments && maxInstallments > 1
      ? maxInstallments
      : MERCADO_PAGO_MAX_INSTALLMENTS;

  const successUrl = buildMentorshipMercadoPagoSuccessUrl(origin, planId, interval, {
    userId,
    externalRef: externalReference,
  });

  coursePaymentDebug('mentorship.create_link.mercadopago.request', {
    planId,
    interval,
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
          id: `${planId}-${interval}`,
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
        failure: `${checkoutBase}/mentoria/empezar?interval=${encodeURIComponent(interval)}&error=pago`,
        pending: successUrl,
      },
      auto_return: 'approved',
      payment_methods: {
        installments,
        default_installments: 1,
      },
      metadata: {
        planId,
        interval,
        type: 'mentorship',
        provider: 'mercadopago',
        ...(userId ? { userId } : {}),
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

    coursePaymentDebug('mentorship.create_link.mercadopago.ok', {
      planId,
      interval,
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
      response?: { data?: { message?: string; error?: string }; status?: number };
      message?: string;
    };
    const mpMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'No se pudo crear el link de Mercado Pago';

    coursePaymentWarn('mentorship.create_link.mercadopago.failed', {
      planId,
      interval,
      externalReference,
      message: String(mpMessage),
    });

    throw new Error(String(mpMessage));
  }
}
