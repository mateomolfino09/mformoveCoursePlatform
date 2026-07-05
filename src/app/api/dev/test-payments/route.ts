import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import dLocalApi from '../../payments/dlocalConfig';
import User from '../../../../models/userModel';
import MentorshipPlan from '../../../../models/mentorshipPlanModel';
import { resolveAuthUserIdFromCookies } from '../../../../lib/resolveAuthUserIdFromCookies';
import { resolveMentorshipDlocalWebhookUrl } from '../../../../lib/mentorshipPaymentUrls';
import { resolveCourseDlocalWebhookUrl } from '../../../../lib/coursePaymentDebug';
import { resolveMentorshipPlanFromDlocalOrderId } from '../../../../lib/resolveMentorshipDlocalOrderId';
import { resolveProductIdFromDlocalOrderId } from '../../../../lib/resolveCursoDlocalOrderId';
import { fulfillMentorshipPurchase } from '../../payments/mentorship/fulfillMentorshipPurchase';

export const runtime = 'nodejs';

const PAID_DLOCAL_STATUSES = new Set(['PAID', 'COMPLETED', 'APPROVED', 'SUCCESS']);

function devOnly() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No disponible en producción' }, { status: 404 });
  }
  return null;
}

async function fetchDlocalPayment(paymentId?: string, orderId?: string) {
  const paymentResponse = paymentId
    ? await dLocalApi.get(`/payments/${paymentId}`)
    : await dLocalApi.get(`/payments`, { params: { order_id: orderId } });

  return paymentResponse.data?.data || paymentResponse.data;
}

export async function GET() {
  const blocked = devOnly();
  if (blocked) return blocked;

  try {
    await connectDB();

    const userId = resolveAuthUserIdFromCookies();
    let user = null;
    if (userId) {
      user = await User.findById(userId).select(
        'email name mentorship pendingMentorshipDlocal',
      );
    }

    const plans = await MentorshipPlan.find({ active: true }).sort({ createdAt: -1 });
    const plan = plans[0];

    return NextResponse.json({
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      webhooks: {
        mentorship: resolveMentorshipDlocalWebhookUrl(),
        course: resolveCourseDlocalWebhookUrl(),
      },
      user: user
        ? {
            _id: user._id.toString(),
            email: user.email,
            name: user.name,
            mentorship: user.mentorship || null,
            pendingMentorshipDlocal: user.pendingMentorshipDlocal || null,
          }
        : null,
      mentorshipPlan: plan
        ? {
            _id: plan._id.toString(),
            name: plan.name,
            active: plan.active,
            prices: (plan.prices || []).map(
              (p: {
                interval: string;
                price: number;
                currency: string;
                stripePriceId?: string;
                opcionesPago?: Array<{ proveedor: string; paymentLink?: string; activo?: boolean }>;
              }) => ({
                interval: p.interval,
                price: p.price,
                currency: p.currency,
                stripePriceId: p.stripePriceId,
                hasStripeLink: Boolean(
                  p.opcionesPago?.find((o) => o.proveedor === 'stripe' && o.paymentLink?.trim()),
                ),
                hasDlocalLink: Boolean(
                  p.opcionesPago?.find((o) => o.proveedor === 'dlocalgo' && o.paymentLink?.trim()),
                ),
              }),
            ),
          }
        : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const blocked = devOnly();
  if (blocked) return blocked;

  try {
    await connectDB();

    const body = await req.json();
    const action = String(body.action || '');

    if (action === 'check-dlocal') {
      const paymentId = String(body.paymentId || '').trim() || undefined;
      const orderId = String(body.orderId || '').trim() || undefined;

      if (!paymentId && !orderId) {
        return NextResponse.json({ error: 'paymentId u orderId requerido' }, { status: 400 });
      }

      const payment = await fetchDlocalPayment(paymentId, orderId);
      const resolvedOrderId =
        typeof payment?.order_id === 'string' ? payment.order_id : orderId;
      const status = String(payment?.status || payment?.payment_status || '').toUpperCase();

      return NextResponse.json({
        payment: {
          id: payment?.id,
          order_id: resolvedOrderId,
          status,
          amount: payment?.amount,
          currency: payment?.currency,
          payerEmail: payment?.payer?.email || payment?.email,
          isPaid: PAID_DLOCAL_STATUSES.has(status),
        },
        resolved: {
          mentorship: resolveMentorshipPlanFromDlocalOrderId(resolvedOrderId),
          courseProductId: resolveProductIdFromDlocalOrderId(resolvedOrderId),
        },
      });
    }

    if (action === 'fulfill-mentorship') {
      const paymentId = String(body.paymentId || '').trim() || undefined;
      const orderId = String(body.orderId || '').trim() || undefined;
      const planId = String(body.planId || '').trim();
      const interval = String(body.interval || '').trim();
      const userId =
        String(body.userId || '').trim() || resolveAuthUserIdFromCookies() || undefined;

      if (!planId || !interval) {
        return NextResponse.json({ error: 'planId e interval requeridos' }, { status: 400 });
      }

      let payment = null;
      if (paymentId || orderId) {
        payment = await fetchDlocalPayment(paymentId, orderId);
        const status = String(payment?.status || payment?.payment_status || '').toUpperCase();
        if (!PAID_DLOCAL_STATUSES.has(status)) {
          return NextResponse.json(
            { error: `Pago dLocal no confirmado (status: ${status || 'desconocido'})` },
            { status: 409 },
          );
        }
      }

      const resolvedOrderId =
        typeof payment?.order_id === 'string' ? payment.order_id : orderId;
      const transactionId = String(
        payment?.id || paymentId || resolvedOrderId || `dev-${Date.now()}`,
      );

      const result = await fulfillMentorshipPurchase({
        planId,
        interval,
        provider: body.provider === 'stripe' ? 'stripe' : 'dlocalgo',
        transactionId,
        email: payment?.payer?.email || payment?.email || body.email,
        userId,
        orderId: resolvedOrderId,
        amount: payment?.amount ?? body.amount,
        moneda: payment?.currency ?? body.moneda,
      });

      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: 'Acción no soportada' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
