import dLocalApi from '../app/api/payments/dlocalConfig';
import { buildMentorshipDlocalOrderId } from './resolveMentorshipDlocalOrderId';
import {
  buildMentorshipDlocalSuccessUrl,
  resolveMentorshipDlocalWebhookUrl,
} from './mentorshipPaymentUrls';
import { coursePaymentDebug, coursePaymentWarn } from './coursePaymentDebug';

const toDlocalCurrency = (moneda?: string) => {
  const normalized = (moneda || 'USD').trim().toUpperCase();
  if (normalized === '$') return 'USD';
  return normalized;
};

export type CreateMentorshipDlocalPaymentResult = {
  orderId: string;
  paymentId?: string;
  paymentLink?: string;
  merchantCheckoutToken?: string;
  notificationUrl: string;
};

export async function createMentorshipDlocalPaymentLink({
  planId,
  interval,
  nombre,
  descripcion,
  precio,
  moneda,
  origin,
  notificationOrigin,
  orderSuffix,
  maxInstallments = 12,
  userId,
  payer,
  country,
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
  payer?: { email?: string; name?: string; id?: string };
  country?: string;
}): Promise<CreateMentorshipDlocalPaymentResult> {
  const webhookBase = notificationOrigin || origin;
  const notificationUrl = resolveMentorshipDlocalWebhookUrl(webhookBase);
  let orderId = buildMentorshipDlocalOrderId(
    planId,
    interval,
    orderSuffix ?? Date.now().toString(36),
  );
  const checkoutBase = origin.replace(/\/$/, '');

  const postPayment = async (oid: string) => {
    const successUrl = buildMentorshipDlocalSuccessUrl(origin, planId, interval, {
      userId,
      orderId: oid,
    });

    coursePaymentDebug('mentorship.create_link.dlocal.request', {
      planId,
      interval,
      orderId: oid,
      amount: Number(precio),
      currency: toDlocalCurrency(moneda),
      notificationUrl,
      successUrl,
      maxInstallments,
    });

    const response = await dLocalApi.post('/payments', {
      name: nombre,
      currency: toDlocalCurrency(moneda),
      amount: Number(precio),
      order_id: oid,
      description: descripcion?.slice(0, 200) || nombre,
      success_url: successUrl,
      back_url: `${checkoutBase}/mentoria/empezar?interval=${encodeURIComponent(interval)}`,
      notification_url: notificationUrl,
      error_url: `${checkoutBase}/mentoria/empezar?interval=${encodeURIComponent(interval)}&error=pago`,
      ...(country?.trim() ? { country: country.trim().toUpperCase() } : {}),
      ...(payer?.email || payer?.name || payer?.id
        ? {
            payer: {
              ...(payer.id ? { id: payer.id } : {}),
              ...(payer.name ? { name: payer.name.slice(0, 100) } : {}),
              ...(payer.email ? { email: payer.email.slice(0, 100) } : {}),
            },
          }
        : {}),
      ...(maxInstallments > 1 ? { max_installments: maxInstallments } : {}),
    });

    return response.data as {
      id?: string;
      redirect_url?: string;
      merchant_checkout_token?: string;
    };
  };

  try {
    const data = await postPayment(orderId);
    coursePaymentDebug('mentorship.create_link.dlocal.ok', {
      planId,
      interval,
      orderId,
      paymentId: data?.id,
      hasRedirectUrl: Boolean(data?.redirect_url),
    });

    return {
      orderId,
      paymentId: data?.id,
      paymentLink: data?.redirect_url,
      merchantCheckoutToken: data?.merchant_checkout_token,
      notificationUrl,
    };
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string; error?: string }; status?: number };
      message?: string;
    };
    const dlocalMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'No se pudo crear el link de dLocal GO';

    const isDuplicateOrder =
      String(dlocalMessage).toLowerCase().includes('duplicate') ||
      err?.response?.status === 409;

    if (!isDuplicateOrder) {
      coursePaymentWarn('mentorship.create_link.dlocal.failed', {
        planId,
        interval,
        orderId,
        message: dlocalMessage,
      });
      throw new Error(dlocalMessage);
    }

    orderId = buildMentorshipDlocalOrderId(planId, interval, Date.now().toString(36));
    coursePaymentWarn('mentorship.create_link.dlocal.duplicate_retry', {
      planId,
      interval,
      retryOrderId: orderId,
      message: dlocalMessage,
    });

    const data = await postPayment(orderId);
    return {
      orderId,
      paymentId: data?.id,
      paymentLink: data?.redirect_url,
      merchantCheckoutToken: data?.merchant_checkout_token,
      notificationUrl,
    };
  }
}
