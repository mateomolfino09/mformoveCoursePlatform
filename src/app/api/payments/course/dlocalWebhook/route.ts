import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import dLocalApi from '../../dlocalConfig';
import { fulfillCoursePurchase } from '../fulfillCoursePurchase';
import Product from '../../../../../models/productModel';
import { isCursoEnPreventa } from '../../../../../lib/cursoLandingPublication';
import { incrementCursoPreventaCupo } from '../../../../../lib/cursoPreventaCupos';

export const runtime = 'nodejs';

const PAID_DLOCAL_STATUSES = new Set(['PAID', 'COMPLETED', 'APPROVED', 'SUCCESS']);

const resolveProductId = (orderId?: string, explicitProductId?: string) => {
  if (explicitProductId) return explicitProductId;
  if (orderId?.startsWith('curso-')) {
    return orderId.replace(/^curso-/, '');
  }
  return null;
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = await req.json();

    const paymentId = payload?.id || payload?.payment_id || payload?.paymentId;
    const orderId = payload?.order_id || payload?.orderId;
    const explicitProductId = payload?.productId;

    if (!paymentId && !orderId) {
      return NextResponse.json({ error: 'Notificación inválida' }, { status: 400 });
    }

    const paymentResponse = paymentId
      ? await dLocalApi.get(`/payments/${paymentId}`)
      : await dLocalApi.get(`/payments`, { params: { order_id: orderId } });

    const payment = paymentResponse.data?.data || paymentResponse.data;
    const status = String(payment?.status || payment?.payment_status || '').toUpperCase();

    if (!PAID_DLOCAL_STATUSES.has(status)) {
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    const productId = resolveProductId(payment?.order_id || orderId, explicitProductId);
    if (!productId) {
      return NextResponse.json({ error: 'No se pudo resolver el producto' }, { status: 422 });
    }

    const transactionId = String(payment?.id || paymentId || orderId);

    const result = await fulfillCoursePurchase({
      productId,
      provider: 'dlocalgo',
      transactionId,
      email: payment?.payer?.email || payment?.email,
      amount: payment?.amount,
      moneda: payment?.currency,
    });

    const product = await Product.findById(productId).lean();
    let preventaCupo = null;
    if (product?.tipo === 'curso' && isCursoEnPreventa(product.cursoConfig)) {
      preventaCupo = await incrementCursoPreventaCupo(productId, undefined, transactionId);
    }

    return NextResponse.json({ received: true, preventaCupo, ...result }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error en webhook dLocal GO de curso:', error);
    return NextResponse.json(
      { error: error?.message || 'No se pudo procesar la notificación' },
      { status: 500 }
    );
  }
}
