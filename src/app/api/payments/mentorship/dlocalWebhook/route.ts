import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import dLocalApi from '../../dlocalConfig';
import {
  coursePaymentDebug,
  coursePaymentError,
  coursePaymentWarn,
} from '../../../../../lib/coursePaymentDebug';
import { resolveMentorshipPlanFromDlocalOrderId } from '../../../../../lib/resolveMentorshipDlocalOrderId';
import { resolveMentorshipDlocalWebhookUrl } from '../../../../../lib/mentorshipPaymentUrls';
import { fulfillMentorshipPurchase } from '../fulfillMentorshipPurchase';

export const runtime = 'nodejs';

const PAID_DLOCAL_STATUSES = new Set(['PAID', 'COMPLETED', 'APPROVED', 'SUCCESS']);

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: 'mentorship-dlocal-webhook',
    notificationUrl: resolveMentorshipDlocalWebhookUrl(),
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

    coursePaymentDebug('mentorship.webhook.received', {
      paymentId: paymentId ? String(paymentId) : undefined,
      orderId: orderId ? String(orderId) : undefined,
    });

    if (!paymentId && !orderId) {
      return NextResponse.json({ error: 'Notificación inválida' }, { status: 400 });
    }

    const paymentResponse = paymentId
      ? await dLocalApi.get(`/payments/${paymentId}`)
      : await dLocalApi.get(`/payments`, { params: { order_id: orderId } });

    const payment = paymentResponse.data?.data || paymentResponse.data;
    const status = String(payment?.status || payment?.payment_status || '').toUpperCase();
    const payerEmail = payment?.payer?.email || payment?.email;
    const resolvedOrderId =
      typeof payment?.order_id === 'string' ? payment.order_id : orderId;

    coursePaymentDebug('mentorship.webhook.payment_fetched', {
      paymentId: payment?.id ? String(payment.id) : paymentId ? String(paymentId) : undefined,
      orderId: resolvedOrderId,
      status,
      payerEmail,
      isPaid: PAID_DLOCAL_STATUSES.has(status),
    });

    if (!PAID_DLOCAL_STATUSES.has(status)) {
      return NextResponse.json({ received: true, ignored: true, status }, { status: 200 });
    }

    const resolved = resolveMentorshipPlanFromDlocalOrderId(resolvedOrderId);
    const planId = resolved.planId;
    const interval = resolved.interval;

    if (!planId || !interval) {
      coursePaymentWarn('mentorship.webhook.plan_unresolved', {
        orderId: resolvedOrderId,
      });
      return NextResponse.json({ error: 'No se pudo resolver el plan' }, { status: 422 });
    }

    const transactionId = String(payment?.id || paymentId || resolvedOrderId);

    coursePaymentDebug('mentorship.webhook.fulfilling', {
      planId,
      interval,
      transactionId,
      payerEmail,
      orderId: resolvedOrderId,
    });

    const result = await fulfillMentorshipPurchase({
      planId,
      interval,
      provider: 'dlocalgo',
      transactionId,
      email: payerEmail,
      orderId: resolvedOrderId,
      amount: payment?.amount,
      moneda: payment?.currency,
    });

    coursePaymentDebug('mentorship.webhook.done', {
      planId,
      interval,
      userId: result.userId,
      alreadyProcessed: result.alreadyProcessed,
      elapsedMs: Date.now() - startedAt,
    });

    return NextResponse.json({ received: true, planId, interval, ...result }, { status: 200 });
  } catch (error) {
    coursePaymentError('mentorship.webhook.error', error, { elapsedMs: Date.now() - startedAt });
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
