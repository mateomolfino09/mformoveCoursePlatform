import dLocalApi from '../app/api/payments/dlocalConfig';
import { buildCursoDlocalOrderId } from './resolveCursoDlocalOrderId';
import { buildCursoDlocalSuccessUrl } from './cursoPaymentUrls';
import { coursePaymentDebug, coursePaymentWarn, resolveCourseDlocalWebhookUrl } from './coursePaymentDebug';

const toDlocalCurrency = (moneda?: string) => {
  const normalized = (moneda || 'USD').trim().toUpperCase();
  if (normalized === '$') return 'USD';
  return normalized;
};

export type CreateCursoDlocalPaymentResult = {
  orderId: string;
  paymentId?: string;
  paymentLink?: string;
  merchantCheckoutToken?: string;
  notificationUrl: string;
};

export async function createCursoDlocalPaymentLink({
  productId,
  nombre,
  descripcion,
  precio,
  moneda,
  origin,
  orderSuffix,
  country,
  maxInstallments,
}: {
  productId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  moneda?: string;
  origin: string;
  orderSuffix?: string;
  country?: string | null;
  maxInstallments?: number;
}): Promise<CreateCursoDlocalPaymentResult> {
  const notificationUrl = resolveCourseDlocalWebhookUrl(origin);
  const dlocalSuccessUrl = buildCursoDlocalSuccessUrl(origin, productId);
  let orderId = buildCursoDlocalOrderId(productId, orderSuffix ?? Date.now().toString(36));

  const normalizedCountry = country?.trim().toUpperCase() || undefined;

  const postPayment = async (oid: string) => {
    coursePaymentDebug('create_link.dlocal.request', {
      productId,
      orderId: oid,
      amount: Number(precio),
      currency: toDlocalCurrency(moneda),
      notificationUrl,
      successUrl: dlocalSuccessUrl,
      country: normalizedCountry,
      maxInstallments,
    });

    const response = await dLocalApi.post('/payments', {
      name: nombre,
      currency: toDlocalCurrency(moneda),
      amount: Number(precio),
      order_id: oid,
      description: descripcion?.slice(0, 200) || nombre,
      success_url: dlocalSuccessUrl,
      back_url: `${origin.replace(/\/$/, '')}/pago/atras?productId=${productId}`,
      notification_url: notificationUrl,
      error_url: `${origin.replace(/\/$/, '')}/pago/error?productId=${productId}`,
      ...(normalizedCountry ? { country: normalizedCountry } : {}),
      ...(maxInstallments && maxInstallments > 1
        ? { max_installments: maxInstallments }
        : {}),
    });

    return response.data as {
      id?: string;
      redirect_url?: string;
      merchant_checkout_token?: string;
    };
  };

  try {
    const data = await postPayment(orderId);
    coursePaymentDebug('create_link.dlocal.ok', {
      productId,
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
      coursePaymentWarn('create_link.dlocal.failed', { productId, orderId, message: dlocalMessage });
      throw new Error(dlocalMessage);
    }

    orderId = buildCursoDlocalOrderId(productId, Date.now().toString(36));
    coursePaymentWarn('create_link.dlocal.duplicate_retry', {
      productId,
      retryOrderId: orderId,
      message: dlocalMessage,
    });

    const data = await postPayment(orderId);
    coursePaymentDebug('create_link.dlocal.ok', {
      productId,
      orderId,
      paymentId: data?.id,
      hasRedirectUrl: Boolean(data?.redirect_url),
      retriedAfterDuplicate: true,
    });

    return {
      orderId,
      paymentId: data?.id,
      paymentLink: data?.redirect_url,
      merchantCheckoutToken: data?.merchant_checkout_token,
      notificationUrl,
    };
  }
}
