import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import dLocalApi from '../../dlocalConfig';
import { stripe } from '../../stripe/stripeConfig';
import { fulfillCoursePurchase } from '../fulfillCoursePurchase';

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
  try {
    await connectDB();

    const body = await req.json();
    const provider = body?.provider as 'stripe' | 'dlocalgo' | undefined;
    const productId = body?.productId as string | undefined;
    const userId = body?.userId as string | undefined;

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

      if (!PAID_DLOCAL_STATUSES.has(status)) {
        return NextResponse.json({ error: 'El pago de dLocal GO no está confirmado' }, { status: 409 });
      }

      const resolvedProductId =
        productId ||
        (typeof payment?.order_id === 'string' && payment.order_id.startsWith('curso-')
          ? payment.order_id.replace(/^curso-/, '')
          : undefined);

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

      return NextResponse.json({ success: true, ...result }, { status: 200 });
    }

    return NextResponse.json({ error: 'Proveedor de pago no soportado' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'No se pudo completar la compra del curso' },
      { status: 500 }
    );
  }
}
