import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import dLocalApi from '../../dlocalConfig';
import User from '../../../../../models/userModel';
import { coursePaymentDebug } from '../../../../../lib/coursePaymentDebug';
import { resolveMentorshipPlanFromDlocalOrderId } from '../../../../../lib/resolveMentorshipDlocalOrderId';
import { buildMentorshipDlocalSuccessUrl } from '../../../../../lib/mentorshipPaymentUrls';
import { resolveMentorshipPaymentOrigin } from '../../../../../lib/resolveMentorshipPaymentOrigin';

export const runtime = 'nodejs';

const PAID_DLOCAL_STATUSES = new Set(['PAID', 'COMPLETED', 'APPROVED', 'SUCCESS']);

import { normalizeDlocalPaymentId } from '../../../../../lib/normalizeDlocalPaymentId';
  try {
    await connectDB();

    const orderId = req.nextUrl.searchParams.get('order_id')?.trim();
    const paymentIdParam = normalizeDlocalPaymentId(req.nextUrl.searchParams.get('payment_id'));
    const userId = req.nextUrl.searchParams.get('external_id')?.trim();

    if (!orderId && !paymentIdParam) {
      return NextResponse.json({ error: 'order_id o payment_id requerido' }, { status: 400 });
    }

    let resolvedOrderId = orderId;
    let resolvedPaymentId = paymentIdParam;

    if (!resolvedPaymentId && userId && orderId) {
      const user = await User.findById(userId).select('pendingMentorshipDlocal');
      if (user?.pendingMentorshipDlocal?.orderId === orderId) {
        resolvedOrderId = orderId;
      }
    }

    const paymentResponse = resolvedPaymentId
      ? await dLocalApi.get(`/payments/${resolvedPaymentId}`)
      : await dLocalApi.get('/payments', { params: { order_id: resolvedOrderId } });

    const payment = paymentResponse.data?.data || paymentResponse.data;
    const status = String(payment?.status || payment?.payment_status || '').toUpperCase();
    const paid = PAID_DLOCAL_STATUSES.has(status);
    const paymentOrderId =
      typeof payment?.order_id === 'string' ? payment.order_id : resolvedOrderId;
    const paymentId = payment?.id ? String(payment.id) : resolvedPaymentId;

    const resolved = resolveMentorshipPlanFromDlocalOrderId(paymentOrderId);
    const planId = resolved.planId;
    const interval = resolved.interval;

    let redirectUrl: string | null = null;
    if (paid && planId && interval) {
      const base = resolveMentorshipPaymentOrigin(req);
      redirectUrl = buildMentorshipDlocalSuccessUrl(base, planId, interval, {
        userId,
        orderId: paymentOrderId,
      });
      const url = new URL(redirectUrl);
      if (paymentId) {
        url.searchParams.set('payment_id', paymentId.replace(/^DP-/i, ''));
      }
      redirectUrl = url.toString();
    }

    coursePaymentDebug('mentorship.dlocal_status', {
      orderId: paymentOrderId,
      paymentId,
      status,
      paid,
      planId,
      interval,
    });

    return NextResponse.json({
      paid,
      status,
      orderId: paymentOrderId,
      paymentId,
      planId,
      interval,
      redirectUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al consultar el pago';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
