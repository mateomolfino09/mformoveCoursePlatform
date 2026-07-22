import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import dLocalApi from '../../dlocalConfig';
import mercadoPagoApi, { isMercadoPagoPaidStatus } from '../../mercadoPagoConfig';
import { stripe } from '../../stripe/stripeConfig';
import User from '../../../../../models/userModel';
import {
  coursePaymentDebug,
  coursePaymentError,
  coursePaymentWarn,
} from '../../../../../lib/coursePaymentDebug';
import { resolveMentorshipPlanFromDlocalOrderId } from '../../../../../lib/resolveMentorshipDlocalOrderId';
import { resolveMentorshipPlanFromMercadoPagoExternalRef } from '../../../../../lib/resolveMentorshipMercadoPagoExternalRef';
import { resolveAuthUserIdFromCookies } from '../../../../../lib/resolveAuthUserIdFromCookies';
import { fulfillMentorshipPurchase } from '../fulfillMentorshipPurchase';
import { normalizeDlocalPaymentId } from '../../../../../lib/normalizeDlocalPaymentId';

export const runtime = 'nodejs';

const PAID_DLOCAL_STATUSES = new Set(['PAID', 'COMPLETED', 'APPROVED', 'SUCCESS']);

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  try {
    await connectDB();

    const body = await req.json();
    const provider = body?.provider as 'stripe' | 'dlocalgo' | 'mercadopago' | undefined;
    const planId = body?.planId as string | undefined;
    const interval = body?.interval as string | undefined;
    const userId =
      (body?.userId as string | undefined)?.trim() ||
      resolveAuthUserIdFromCookies() ||
      undefined;

    coursePaymentDebug('mentorship.complete.received', {
      provider,
      planId,
      interval,
      userId,
      hasSessionId: Boolean(body?.sessionId),
      hasPaymentId: Boolean(body?.paymentId),
      hasOrderId: Boolean(body?.orderId),
    });

    if (!provider) {
      return NextResponse.json({ error: 'Proveedor de pago requerido' }, { status: 400 });
    }

    if (!planId || !interval) {
      return NextResponse.json({ error: 'planId e interval son requeridos' }, { status: 400 });
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

      const resolvedPlanId = session.metadata?.planId || planId;
      const resolvedInterval = session.metadata?.interval || interval;

      const result = await fulfillMentorshipPurchase({
        planId: resolvedPlanId,
        interval: resolvedInterval,
        provider: 'stripe',
        transactionId: String(session.subscription || session.payment_intent || session.id),
        email: session.customer_details?.email || session.metadata?.email,
        userId,
        amount: session.amount_total ? session.amount_total / 100 : undefined,
        moneda: session.currency?.toUpperCase(),
      });

      coursePaymentDebug('mentorship.complete.stripe.done', {
        planId: resolvedPlanId,
        alreadyProcessed: result.alreadyProcessed,
        elapsedMs: Date.now() - startedAt,
      });

      return NextResponse.json({ success: true, ...result }, { status: 200 });
    }

    if (provider === 'dlocalgo') {
      let paymentId = normalizeDlocalPaymentId(body?.paymentId as string | undefined);
      let orderId = body?.orderId as string | undefined;

      if (!paymentId && !orderId && userId) {
        const user = await User.findById(userId).select('pendingMentorshipDlocal');
        const pendingOrderId = user?.pendingMentorshipDlocal?.orderId;
        if (pendingOrderId) {
          orderId = pendingOrderId;
          coursePaymentDebug('mentorship.complete.dlocal.pending_order', {
            userId,
            orderId,
          });
        }
      }

      if (!paymentId && !orderId) {
        return NextResponse.json(
          { error: 'paymentId u orderId requerido para dLocal GO' },
          { status: 400 },
        );
      }

      const paymentResponse = paymentId
        ? await dLocalApi.get(`/payments/${paymentId}`)
        : await dLocalApi.get(`/payments`, { params: { order_id: orderId } });

      const payment = paymentResponse.data?.data || paymentResponse.data;
      const status = String(payment?.status || payment?.payment_status || '').toUpperCase();
      const resolvedOrderId =
        typeof payment?.order_id === 'string' ? payment.order_id : orderId;

      coursePaymentDebug('mentorship.complete.dlocal.payment_fetched', {
        paymentId: payment?.id ? String(payment.id) : paymentId,
        orderId: resolvedOrderId,
        status,
        payerEmail: payment?.payer?.email || payment?.email,
      });

      if (!PAID_DLOCAL_STATUSES.has(status)) {
        coursePaymentWarn('mentorship.complete.dlocal.not_paid', { status });
        return NextResponse.json({ error: 'El pago de dLocal GO no está confirmado' }, { status: 409 });
      }

      const resolved = resolveMentorshipPlanFromDlocalOrderId(resolvedOrderId);
      const resolvedPlanId = planId || resolved.planId;
      const resolvedInterval = interval || resolved.interval;

      if (!resolvedPlanId || !resolvedInterval) {
        return NextResponse.json(
          { error: 'No se pudo resolver el plan de mentoría' },
          { status: 422 },
        );
      }

      const result = await fulfillMentorshipPurchase({
        planId: resolvedPlanId,
        interval: resolvedInterval,
        provider: 'dlocalgo',
        transactionId: String(payment?.id || paymentId || resolvedOrderId),
        email: payment?.payer?.email || payment?.email,
        userId,
        orderId: resolvedOrderId,
        amount: payment?.amount,
        moneda: payment?.currency,
      });

      coursePaymentDebug('mentorship.complete.dlocal.done', {
        planId: resolvedPlanId,
        alreadyProcessed: result.alreadyProcessed,
        userId: result.userId,
        elapsedMs: Date.now() - startedAt,
      });

      return NextResponse.json({ success: true, ...result }, { status: 200 });
    }

    if (provider === 'mercadopago') {
      const paymentId =
        (body?.paymentId as string | undefined) ||
        (body?.collectionId as string | undefined);
      const externalReference = body?.externalReference as string | undefined;

      if (!paymentId) {
        return NextResponse.json(
          { error: 'paymentId requerido para Mercado Pago' },
          { status: 400 },
        );
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

      if (!isMercadoPagoPaidStatus(payment?.status)) {
        coursePaymentWarn('mentorship.complete.mercadopago.not_paid', {
          status: payment?.status,
        });
        return NextResponse.json(
          { error: 'El pago de Mercado Pago no está confirmado' },
          { status: 409 },
        );
      }

      const fromRef = resolveMentorshipPlanFromMercadoPagoExternalRef(
        payment?.external_reference || externalReference,
      );
      const resolvedPlanId = planId || payment?.metadata?.planId || fromRef.planId;
      const resolvedInterval =
        interval || payment?.metadata?.interval || fromRef.interval;

      if (!resolvedPlanId || !resolvedInterval) {
        return NextResponse.json(
          { error: 'No se pudo resolver el plan de mentoría' },
          { status: 422 },
        );
      }

      const result = await fulfillMentorshipPurchase({
        planId: resolvedPlanId,
        interval: resolvedInterval,
        provider: 'mercadopago',
        transactionId: String(payment?.id || paymentId),
        email: payment?.payer?.email,
        userId: userId || payment?.metadata?.userId,
        orderId: payment?.external_reference || externalReference,
        amount: payment?.transaction_amount,
        moneda: payment?.currency_id,
      });

      coursePaymentDebug('mentorship.complete.mercadopago.done', {
        planId: resolvedPlanId,
        alreadyProcessed: result.alreadyProcessed,
        userId: result.userId,
        elapsedMs: Date.now() - startedAt,
      });

      return NextResponse.json({ success: true, ...result }, { status: 200 });
    }

    return NextResponse.json({ error: 'Proveedor de pago no soportado' }, { status: 400 });
  } catch (error: unknown) {
    coursePaymentError('mentorship.complete.failed', error, { elapsedMs: Date.now() - startedAt });
    const message =
      error instanceof Error ? error.message : 'No se pudo completar la compra de mentoría';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
