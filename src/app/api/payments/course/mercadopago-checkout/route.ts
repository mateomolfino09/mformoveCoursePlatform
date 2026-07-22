import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import Product from '../../../../../models/productModel';
import User from '../../../../../models/userModel';
import { createCursoMercadoPagoPaymentLink } from '../../../../../lib/cursoMercadoPagoPaymentLink';
import { persistCursoMercadoPagoPaymentLink } from '../../../../../lib/persistCursoMercadoPagoPaymentLink';
import { userHasPurchasedCourse } from '../../../../../lib/courseAccess';
import { resolveCursoCheckoutPlans } from '../../../../../lib/cursoPricing';
import { coursePaymentDebug, coursePaymentWarn } from '../../../../../lib/coursePaymentDebug';
import { MERCADO_PAGO_MAX_INSTALLMENTS } from '../../mercadoPagoConfig';
import { isProveedorHabilitado } from '../../../../../constants/paymentProveedores';

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

    const user = await User.findById(decoded.userId || decoded._id).select(
      'cursosAdquiridos email'
    );
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

    if (
      !isProveedorHabilitado(
        product.cursoConfig?.planes?.proveedoresHabilitados,
        'mercadopago'
      )
    ) {
      return NextResponse.json(
        { error: 'Mercado Pago no está habilitado para este curso' },
        { status: 400 }
      );
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

    const origin =
      process.env.NEXT_PUBLIC_BASE_URL ||
      req.headers.get('origin') ||
      'http://localhost:3000';

    coursePaymentDebug('mercadopago_checkout.regenerate', {
      productId,
      userId: user._id.toString(),
      preventaTierIndex: tierIndex,
      precio,
      moneda,
      maxInstallments: MERCADO_PAGO_MAX_INSTALLMENTS,
    });

    const created = await createCursoMercadoPagoPaymentLink({
      productId,
      nombre,
      descripcion,
      precio,
      moneda,
      origin,
      maxInstallments: MERCADO_PAGO_MAX_INSTALLMENTS,
      payerEmail: user.email,
    });

    if (!created.preferenceId) {
      coursePaymentWarn('mercadopago_checkout.no_preference', {
        productId,
      });
      return NextResponse.json(
        { error: 'Mercado Pago no devolvió preferenceId' },
        { status: 502 }
      );
    }

    await persistCursoMercadoPagoPaymentLink(
      productId,
      {
        paymentLink: created.paymentLink || '',
        mercadoPagoPreferenceId: created.preferenceId,
        mercadoPagoExternalReference: created.externalReference,
      },
      tierIndex
    );

    return NextResponse.json(
      {
        redirectUrl: created.paymentLink,
        preferenceId: created.preferenceId,
        externalReference: created.externalReference,
        amount: created.amount,
        currency: created.currency,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'No se pudo crear el checkout Mercado Pago';
    coursePaymentWarn('mercadopago_checkout.failed', { message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
