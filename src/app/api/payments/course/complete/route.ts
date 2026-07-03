import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import dLocalApi from '../../dlocalConfig';
import { stripe } from '../../stripe/stripeConfig';
import { fulfillCoursePurchase } from '../fulfillCoursePurchase';
import {
  coursePaymentDebug,
  coursePaymentError,
  coursePaymentWarn,
} from '../../../../../lib/coursePaymentDebug';
import { resolveProductIdFromDlocalOrderId } from '../../../../../lib/resolveCursoDlocalOrderId';
import { resolveAuthUserIdFromCookies } from '../../../../../lib/resolveAuthUserIdFromCookies';

export const runtime = 'nodejs';

const PAID_DLOCAL_STATUSES = new Set(['PAID', 'COMPLETED', 'APPROVED', 'SUCCESS']);

const resolveStripeProductId = async (session: any, fallbackProductId?: string) => {
  if (session.metadata?.productId) {
    return session.metadata.productId as string;
  }

  if (fallbackProductId) {
    return fallbackProductId;
  }

  if (session.payment_link) {
    const paymentLink = await stripe.paymentLinks.retrieve(session.payment_link);
    if (paymentLink.metadata?.productId) {
      return paymentLink.metadata.productId;
    }
  }

  return null;
};

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  try {
    await connectDB();

    const body = await req.json();
    const provider = body?.provider as 'stripe' | 'dlocalgo' | undefined;
    const productId = body?.productId as string | undefined;
    const userId =
      (body?.userId as string | undefined)?.trim() ||
      resolveAuthUserIdFromCookies() ||
      undefined;

    coursePaymentDebug('complete.received', {
      provider,
      productId,
      userId,
      hasSessionId: Boolean(body?.sessionId),
      hasPaymentId: Boolean(body?.paymentId),
      hasOrderId: Boolean(body?.orderId),
    });

    if (!provider) {
      return NextResponse.json({ error: 'Proveedor de pago requerido' }, { status: 400 });
    }

    if (provider === 'stripe') {
      const sessionId = body?.sessionId as string | undefined;
      if (!sessionId) {
        return NextResponse.json({ error: 'sessionId requerido para Stripe' }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return NextResponse.json({ error: 'El pago de Stripe no está confirmado' }, { status: 409 });
      }

      const resolvedProductId = await resolveStripeProductId(session, productId);
      if (!resolvedProductId) {
        return NextResponse.json({ error: 'No se pudo resolver el producto del curso' }, { status: 422 });
      }

      const result = await fulfillCoursePurchase({
        productId: resolvedProductId,
        provider: 'stripe',
        transactionId: String(session.payment_intent || session.id),
        email: session.customer_details?.email,
        userId,
        amount: session.amount_total ? session.amount_total / 100 : undefined,
        moneda: session.currency?.toUpperCase(),
      });

      coursePaymentDebug('complete.stripe.done', {
        productId: resolvedProductId,
        alreadyProcessed: result.alreadyProcessed,
        elapsedMs: Date.now() - startedAt,
      });

      return NextResponse.json({ success: true, ...result }, { status: 200 });
    }

    if (provider === 'dlocalgo') {
      const paymentId = body?.paymentId as string | undefined;
      const orderId = body?.orderId as string | undefined;

      if (!paymentId && !orderId) {
        return NextResponse.json({ error: 'paymentId u orderId requerido para dLocal GO' }, { status: 400 });
      }

      const paymentResponse = paymentId
        ? await dLocalApi.get(`/payments/${paymentId}`)
        : await dLocalApi.get(`/payments`, { params: { order_id: orderId } });

      const payment = paymentResponse.data?.data || paymentResponse.data;
      const status = String(payment?.status || payment?.payment_status || '').toUpperCase();

      coursePaymentDebug('complete.dlocal.payment_fetched', {
        paymentId: payment?.id ? String(payment.id) : paymentId,
        orderId: payment?.order_id || orderId,
        status,
        payerEmail: payment?.payer?.email || payment?.email,
      });

      if (!PAID_DLOCAL_STATUSES.has(status)) {
        coursePaymentWarn('complete.dlocal.not_paid', { status });
        return NextResponse.json({ error: 'El pago de dLocal GO no está confirmado' }, { status: 409 });
      }

      const resolvedProductId =
        productId ||
        resolveProductIdFromDlocalOrderId(
          typeof payment?.order_id === 'string' ? payment.order_id : orderId
        );

      if (!resolvedProductId) {
        return NextResponse.json({ error: 'No se pudo resolver el producto del curso' }, { status: 422 });
      }

      const result = await fulfillCoursePurchase({
        productId: resolvedProductId,
        provider: 'dlocalgo',
        transactionId: String(payment?.id || paymentId || orderId),
        email: payment?.payer?.email || payment?.email,
        userId,
        amount: payment?.amount,
        moneda: payment?.currency,
      });

      coursePaymentDebug('complete.dlocal.done', {
        productId: resolvedProductId,
        alreadyProcessed: result.alreadyProcessed,
        userId: result.userId,
        elapsedMs: Date.now() - startedAt,
      });

      return NextResponse.json({ success: true, ...result }, { status: 200 });
    }

    return NextResponse.json({ error: 'Proveedor de pago no soportado' }, { status: 400 });
  } catch (error: unknown) {
    coursePaymentError('complete.failed', error, { elapsedMs: Date.now() - startedAt });
    const message = error instanceof Error ? error.message : 'No se pudo completar la compra del curso';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
