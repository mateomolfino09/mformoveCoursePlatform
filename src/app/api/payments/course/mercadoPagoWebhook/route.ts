import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import mercadoPagoApi, { isMercadoPagoPaidStatus } from '../../mercadoPagoConfig';
import { fulfillCoursePurchase } from '../fulfillCoursePurchase';
import Product from '../../../../../models/productModel';
import { isCursoEnPreventa } from '../../../../../lib/cursoLandingPublication';
import { incrementCursoPreventaCupo } from '../../../../../lib/cursoPreventaCupos';
import {
  coursePaymentDebug,
  coursePaymentError,
  coursePaymentWarn,
} from '../../../../../lib/coursePaymentDebug';
import { resolveCourseMercadoPagoWebhookUrl } from '../../../../../lib/cursoPaymentUrls';
import { resolveProductIdFromMercadoPagoExternalRef } from '../../../../../lib/resolveCursoMercadoPagoExternalRef';

export const runtime = 'nodejs';

const resolvePaymentId = (req: NextRequest, payload: Record<string, unknown>) => {
  const fromQuery =
    req.nextUrl.searchParams.get('data.id') ||
    req.nextUrl.searchParams.get('id') ||
    req.nextUrl.searchParams.get('data_id');
  if (fromQuery) return fromQuery;

  const data = payload?.data as { id?: string | number } | undefined;
  if (data?.id != null) return String(data.id);
  if (payload?.id != null) return String(payload.id);
  return null;
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: 'course-mercadopago-webhook',
    notificationUrl: resolveCourseMercadoPagoWebhookUrl(),
  });
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  try {
    await connectDB();

    const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const topic =
      req.nextUrl.searchParams.get('topic') ||
      req.nextUrl.searchParams.get('type') ||
      String(payload?.type || payload?.topic || '');
    const paymentId = resolvePaymentId(req, payload);

    coursePaymentDebug('mercadopago.webhook.received', {
      topic,
      paymentId: paymentId || undefined,
      payloadKeys: Object.keys(payload || {}),
    });

    const isPaymentTopic =
      !topic ||
      topic === 'payment' ||
      topic === 'payments' ||
      String(topic).includes('payment');

    if (!isPaymentTopic || !paymentId) {
      coursePaymentDebug('mercadopago.webhook.ignored', { topic, paymentId });
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    const paymentResponse = await mercadoPagoApi.get(`/v1/payments/${paymentId}`);
    const payment = paymentResponse.data as {
      id?: string | number;
      status?: string;
      external_reference?: string;
      transaction_amount?: number;
      currency_id?: string;
      payer?: { email?: string };
      metadata?: { productId?: string; userId?: string; preventaTierIndex?: number };
    };

    const status = String(payment?.status || '');
    coursePaymentDebug('mercadopago.webhook.payment_fetched', {
      paymentId: payment?.id ? String(payment.id) : paymentId,
      status,
      externalReference: payment?.external_reference,
      isPaid: isMercadoPagoPaidStatus(status),
    });

    if (!isMercadoPagoPaidStatus(status)) {
      return NextResponse.json({ received: true, ignored: true, status }, { status: 200 });
    }

    const productId =
      payment?.metadata?.productId ||
      resolveProductIdFromMercadoPagoExternalRef(payment?.external_reference);

    if (!productId) {
      coursePaymentWarn('mercadopago.webhook.product_unresolved', {
        externalReference: payment?.external_reference,
      });
      return NextResponse.json({ error: 'No se pudo resolver el producto' }, { status: 422 });
    }

    const transactionId = String(payment?.id || paymentId);

    const result = await fulfillCoursePurchase({
      productId,
      provider: 'mercadopago',
      transactionId,
      email: payment?.payer?.email,
      userId: payment?.metadata?.userId,
      amount: payment?.transaction_amount,
      moneda: payment?.currency_id,
    });

    const product = await Product.findById(productId).lean();
    let preventaCupo = null;
    if (product?.tipo === 'curso' && isCursoEnPreventa(product.cursoConfig)) {
      const tierFromMeta =
        typeof payment?.metadata?.preventaTierIndex === 'number'
          ? payment.metadata.preventaTierIndex
          : undefined;
      preventaCupo = await incrementCursoPreventaCupo(productId, tierFromMeta, transactionId);
    }

    coursePaymentDebug('mercadopago.webhook.done', {
      productId,
      transactionId,
      userId: result.userId,
      alreadyProcessed: result.alreadyProcessed,
      elapsedMs: Date.now() - startedAt,
    });

    return NextResponse.json({ received: true, preventaCupo, ...result }, { status: 200 });
  } catch (error: unknown) {
    coursePaymentError('mercadopago.webhook.failed', error, {
      elapsedMs: Date.now() - startedAt,
    });
    const message = error instanceof Error ? error.message : 'No se pudo procesar la notificación';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
