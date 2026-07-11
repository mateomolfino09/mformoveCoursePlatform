import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import dLocalApi from '../../dlocalConfig';
import { fulfillCoursePurchase } from '../fulfillCoursePurchase';
import Product from '../../../../../models/productModel';
import { isCursoEnPreventa } from '../../../../../lib/cursoLandingPublication';
import { incrementCursoPreventaCupo } from '../../../../../lib/cursoPreventaCupos';
import {
  coursePaymentDebug,
  coursePaymentError,
  coursePaymentWarn,
  resolveCourseDlocalWebhookUrl,
} from '../../../../../lib/coursePaymentDebug';
import { resolveProductIdFromDlocalOrderId } from '../../../../../lib/resolveCursoDlocalOrderId';

export const runtime = 'nodejs';

const PAID_DLOCAL_STATUSES = new Set(['PAID', 'COMPLETED', 'APPROVED', 'SUCCESS']);

const resolveProductId = (orderId?: string, explicitProductId?: string) => {
  if (explicitProductId) return explicitProductId;
  return resolveProductIdFromDlocalOrderId(orderId);
};

/** Ping público para verificar que dLocal / ngrok puede alcanzar este endpoint. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: 'course-dlocal-webhook',
    notificationUrl: resolveCourseDlocalWebhookUrl(),
    paidStatuses: Array.from(PAID_DLOCAL_STATUSES),
  });
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  try {
    await connectDB();
    const payload = await req.json();

    const paymentId = payload?.id || payload?.payment_id || payload?.paymentId;
    const orderId = payload?.order_id || payload?.orderId;
    const explicitProductId = payload?.productId;

    coursePaymentDebug('webhook.received', {
      paymentId: paymentId ? String(paymentId) : undefined,
      orderId: orderId ? String(orderId) : undefined,
      explicitProductId,
      payloadKeys: Object.keys(payload || {}),
    });

    if (!paymentId && !orderId) {
      coursePaymentWarn('webhook.invalid_payload', { reason: 'missing paymentId and orderId' });
      return NextResponse.json({ error: 'Notificación inválida' }, { status: 400 });
    }

    const paymentResponse = paymentId
      ? await dLocalApi.get(`/payments/${paymentId}`)
      : await dLocalApi.get(`/payments`, { params: { order_id: orderId } });

    const payment = paymentResponse.data?.data || paymentResponse.data;
    const status = String(payment?.status || payment?.payment_status || '').toUpperCase();
    const payerEmail = payment?.payer?.email || payment?.email;

    coursePaymentDebug('webhook.payment_fetched', {
      paymentId: payment?.id ? String(payment.id) : paymentId ? String(paymentId) : undefined,
      orderId: payment?.order_id || orderId,
      status,
      amount: payment?.amount,
      currency: payment?.currency,
      payerEmail,
      isPaid: PAID_DLOCAL_STATUSES.has(status),
    });

    if (!PAID_DLOCAL_STATUSES.has(status)) {
      coursePaymentDebug('webhook.ignored_unpaid', { status });
      return NextResponse.json({ received: true, ignored: true, status }, { status: 200 });
    }

    const productId = resolveProductId(payment?.order_id || orderId, explicitProductId);
    if (!productId) {
      coursePaymentWarn('webhook.product_unresolved', {
        orderId: payment?.order_id || orderId,
        explicitProductId,
      });
      return NextResponse.json({ error: 'No se pudo resolver el producto' }, { status: 422 });
    }

    const transactionId = String(payment?.id || paymentId || orderId);

    coursePaymentDebug('webhook.fulfilling', { productId, transactionId, payerEmail });

    const result = await fulfillCoursePurchase({
      productId,
      provider: 'dlocalgo',
      transactionId,
      email: payerEmail,
      amount: payment?.amount,
      moneda: payment?.currency,
    });

    const product = await Product.findById(productId).lean();
    let preventaCupo = null;
    if (product?.tipo === 'curso' && isCursoEnPreventa(product.cursoConfig)) {
      preventaCupo = await incrementCursoPreventaCupo(productId, undefined, transactionId);
      coursePaymentDebug('webhook.preventa_cupo', { productId, preventaCupo });
    }

    coursePaymentDebug('webhook.done', {
      productId,
      transactionId,
      userId: result.userId,
      alreadyProcessed: result.alreadyProcessed,
      elapsedMs: Date.now() - startedAt,
    });

    return NextResponse.json({ received: true, preventaCupo, ...result }, { status: 200 });
  } catch (error: unknown) {
    coursePaymentError('webhook.failed', error, { elapsedMs: Date.now() - startedAt });
    const message = error instanceof Error ? error.message : 'No se pudo procesar la notificación';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
