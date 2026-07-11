import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import Product from '../../../../../models/productModel';
import User from '../../../../../models/userModel';
import { createCursoDlocalPaymentLink } from '../../../../../lib/cursoDlocalPaymentLink';
import { persistCursoDlocalPaymentLink } from '../../../../../lib/persistCursoDlocalPaymentLink';
import { userHasPurchasedCourse } from '../../../../../lib/courseAccess';
import {
  resolveCursoCheckoutPlans,
} from '../../../../../lib/cursoPricing';
import { coursePaymentDebug, coursePaymentWarn } from '../../../../../lib/coursePaymentDebug';
import { resolveDlocalLocalizedAmount } from '../../../../../lib/dlocalLocalCurrency';
import { resolvePayerCountry } from '../../../../../lib/resolveRequestCountry';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userToken = cookies().get('userToken')?.value;
    if (!userToken) {
      return NextResponse.json({ error: 'Iniciá sesión para continuar' }, { status: 401 });
    }

    const decoded = verify(userToken, process.env.NEXTAUTH_SECRET as string) as {
      userId?: string;
      _id?: string;
    };

    const user = await User.findById(decoded.userId || decoded._id).select('cursosAdquiridos country');
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const productId = String(body.productId || '').trim();
    const preventaTierIndexRaw = body.preventaTierIndex;
    const preventaTierIndex =
      preventaTierIndexRaw != null && preventaTierIndexRaw !== ''
        ? Number(preventaTierIndexRaw)
        : undefined;

    if (!productId) {
      return NextResponse.json({ error: 'productId requerido' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product || product.tipo !== 'curso') {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    if (userHasPurchasedCourse(user, productId)) {
      return NextResponse.json(
        { error: 'Ya tenés acceso a este curso' },
        { status: 409 }
      );
    }

    const cursoConfig = product.cursoConfig;
    const pricing = resolveCursoCheckoutPlans(cursoConfig);
    const nombre = product.nombre || product.name || 'Curso';
    const descripcion = product.descripcion || product.description || nombre;

    let precio = Number(product.precio);
    let moneda = product.moneda || 'USD';
    let tierIndex: number | undefined;

    if (pricing.modo === 'preventa' && pricing.preventaTierIndex != null) {
      tierIndex = pricing.preventaTierIndex;
      const tier = cursoConfig?.preciosPreventa?.[tierIndex];
      if (!tier) {
        return NextResponse.json({ error: 'Preventa no disponible' }, { status: 400 });
      }
      precio = Number(tier.monto);
      moneda = tier.moneda || moneda;
    } else if (
      preventaTierIndex != null &&
      !Number.isNaN(preventaTierIndex) &&
      preventaTierIndex >= 0
    ) {
      tierIndex = preventaTierIndex;
      const tier = cursoConfig?.preciosPreventa?.[preventaTierIndex];
      if (tier) {
        precio = Number(tier.monto);
        moneda = tier.moneda || moneda;
      }
    }

    if (!precio || precio <= 0) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 });
    }

    const payerCountry = resolvePayerCountry(
      String(body.country || user.country || ''),
      req
    );

    if (payerCountry && !String(user.country || '').trim()) {
      user.country = payerCountry;
      await user.save();
    }

    const localized = await resolveDlocalLocalizedAmount({
      amount: precio,
      sourceCurrency: moneda,
      country: payerCountry,
    });

    const origin =
      process.env.NEXT_PUBLIC_BASE_URL ||
      req.headers.get('origin') ||
      'http://localhost:3000';

    coursePaymentDebug('dlocal_checkout.regenerate', {
      productId,
      userId: user._id.toString(),
      preventaTierIndex: tierIndex,
      payerCountry,
      originalPrecio: precio,
      originalMoneda: moneda,
      dlocalPrecio: localized.amount,
      dlocalMoneda: localized.currency,
      exchangeRate: localized.exchangeRate,
      localized: localized.localized,
    });

    const created = await createCursoDlocalPaymentLink({
      productId,
      nombre,
      descripcion,
      precio: localized.amount,
      moneda: localized.currency,
      origin,
      country: localized.countryCode || payerCountry,
      maxInstallments: 12,
    });

    if (!created.paymentLink) {
      coursePaymentWarn('dlocal_checkout.no_redirect', { productId, orderId: created.orderId });
      return NextResponse.json(
        { error: 'dLocal no devolvió URL de checkout' },
        { status: 502 }
      );
    }

    await persistCursoDlocalPaymentLink(
      productId,
      {
        paymentLink: created.paymentLink,
        dlocalOrderId: created.orderId,
        dlocalPaymentId: created.paymentId,
        merchantCheckoutToken: created.merchantCheckoutToken,
      },
      tierIndex
    );

    return NextResponse.json(
      {
        redirectUrl: created.paymentLink,
        orderId: created.orderId,
        paymentId: created.paymentId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'No se pudo crear el checkout dLocal';
    coursePaymentWarn('dlocal_checkout.failed', { message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
