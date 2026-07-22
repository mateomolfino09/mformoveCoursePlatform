import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import mercadoPagoApi, { isMercadoPagoPaidStatus } from '../../mercadoPagoConfig';
import { fulfillMentorshipPurchase } from '../fulfillMentorshipPurchase';
import {
  coursePaymentDebug,
  coursePaymentError,
  coursePaymentWarn,
} from '../../../../../lib/coursePaymentDebug';
import { resolveMentorshipMercadoPagoWebhookUrl } from '../../../../../lib/mentorshipPaymentUrls';
import { resolveMentorshipPlanFromMercadoPagoExternalRef } from '../../../../../lib/resolveMentorshipMercadoPagoExternalRef';

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
    endpoint: 'mentorship-mercadopago-webhook',
    notificationUrl: resolveMentorshipMercadoPagoWebhookUrl(),
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

    coursePaymentDebug('mentorship.mercadopago.webhook.received', {
      topic,
      paymentId: paymentId || undefined,
    });

    const isPaymentTopic =
      !topic ||
      topic === 'payment' ||
      topic === 'payments' ||
      String(topic).includes('payment');

    if (!isPaymentTopic || !paymentId) {
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
      metadata?: { planId?: string; interval?: string; userId?: string };
    };

    const status = String(payment?.status || '');
    if (!isMercadoPagoPaidStatus(status)) {
      return NextResponse.json({ received: true, ignored: true, status }, { status: 200 });
    }

    const fromRef = resolveMentorshipPlanFromMercadoPagoExternalRef(
      payment?.external_reference
    );
    const planId = payment?.metadata?.planId || fromRef.planId;
    const interval = payment?.metadata?.interval || fromRef.interval;

    if (!planId || !interval) {
      coursePaymentWarn('mentorship.mercadopago.webhook.plan_unresolved', {
        externalReference: payment?.external_reference,
      });
      return NextResponse.json({ error: 'No se pudo resolver el plan' }, { status: 422 });
    }

    const result = await fulfillMentorshipPurchase({
      planId,
      interval,
      provider: 'mercadopago',
      transactionId: String(payment?.id || paymentId),
      email: payment?.payer?.email,
      userId: payment?.metadata?.userId,
      orderId: payment?.external_reference,
      amount: payment?.transaction_amount,
      moneda: payment?.currency_id,
    });

    coursePaymentDebug('mentorship.mercadopago.webhook.done', {
      planId,
      interval,
      userId: result.userId,
      alreadyProcessed: result.alreadyProcessed,
      elapsedMs: Date.now() - startedAt,
    });

    return NextResponse.json({ received: true, ...result }, { status: 200 });
  } catch (error: unknown) {
    coursePaymentError('mentorship.mercadopago.webhook.failed', error, {
      elapsedMs: Date.now() - startedAt,
    });
    const message = error instanceof Error ? error.message : 'No se pudo procesar la notificación';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
