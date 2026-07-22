import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import Product from '../../../../../models/productModel';
import User from '../../../../../models/userModel';
import mercadoPagoApi, { isMercadoPagoPaidStatus } from '../../mercadoPagoConfig';
import { fulfillCoursePurchase } from '../fulfillCoursePurchase';
import { userHasPurchasedCourse } from '../../../../../lib/courseAccess';
import { resolveCursoCheckoutPlans } from '../../../../../lib/cursoPricing';
import { buildCursoMercadoPagoExternalRef } from '../../../../../lib/resolveCursoMercadoPagoExternalRef';
import { buildCursoMercadoPagoSuccessUrl } from '../../../../../lib/cursoPaymentUrls';
import { coursePaymentDebug, coursePaymentWarn } from '../../../../../lib/coursePaymentDebug';
import { isProveedorHabilitado } from '../../../../../constants/paymentProveedores';
import { incrementCursoPreventaCupo } from '../../../../../lib/cursoPreventaCupos';
import { isCursoEnPreventa } from '../../../../../lib/cursoLandingPublication';
import {
  getMercadoPagoApiErrorMessage,
  getMercadoPagoApiStatus,
  messageFromMercadoPagoStatusDetail,
} from '../../../../../lib/mercadoPagoErrors';

export const runtime = 'nodejs';

type BrickBody = {
  productId?: string;
  preventaTierIndex?: number;
  paymentType?: string;
  selectedPaymentMethod?: string;
  formData?: {
    token?: string;
    transaction_amount?: number;
    transactionAmount?: number;
    installments?: number;
    payment_method_id?: string;
    paymentMethodId?: string;
    issuer_id?: string | number;
    issuerId?: string | number;
    payer?: {
      email?: string;
      identification?: { type?: string; number?: string };
    };
  };
};

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
      'cursosAdquiridos email name'
    );
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) as BrickBody;
    const productId = String(body.productId || '').trim();
    const formData = body.formData || {};

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
      return NextResponse.json({ error: 'Ya tenés acceso a este curso' }, { status: 409 });
    }

    const pricing = resolveCursoCheckoutPlans(product.cursoConfig);
    let precio = Number(product.precio);
    let moneda = product.moneda || 'USD';
    let tierIndex: number | undefined;

    if (pricing.modo === 'preventa' && pricing.preventaTierIndex != null) {
      tierIndex = pricing.preventaTierIndex;
      const tier = product.cursoConfig?.preciosPreventa?.[tierIndex];
      if (tier) {
        precio = Number(tier.monto);
        moneda = tier.moneda || moneda;
      }
    } else if (body.preventaTierIndex != null && !Number.isNaN(Number(body.preventaTierIndex))) {
      tierIndex = Number(body.preventaTierIndex);
      const tier = product.cursoConfig?.preciosPreventa?.[tierIndex];
      if (tier) {
        precio = Number(tier.monto);
        moneda = tier.moneda || moneda;
      }
    }

    const amountFromBrick = Number(
      formData.transaction_amount ?? formData.transactionAmount ?? precio
    );
    if (!amountFromBrick || amountFromBrick <= 0) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
    }

    const paymentMethodId = formData.payment_method_id || formData.paymentMethodId;
    const installments = Number(formData.installments || 1);
    const token = formData.token;
    const issuerId = formData.issuer_id ?? formData.issuerId;
    const payerEmail = formData.payer?.email || user.email;
    const externalReference = buildCursoMercadoPagoExternalRef(
      productId,
      Date.now().toString(36)
    );

    const origin =
      process.env.NEXT_PUBLIC_BASE_URL ||
      req.headers.get('origin') ||
      'http://localhost:3000';

    const paymentType = String(body.selectedPaymentMethod || body.paymentType || '');

    coursePaymentDebug('mercadopago_brick.process', {
      productId,
      paymentType,
      amount: amountFromBrick,
      paymentMethodId,
      installments,
    });

    // Wallet / cuenta Mercado Pago: el Brick puede devolver formData sin token de tarjeta.
    const paymentPayload: Record<string, unknown> = {
      transaction_amount: amountFromBrick,
      description: product.nombre || product.name || 'Curso',
      external_reference: externalReference,
      metadata: {
        productId,
        purchaseType: 'curso_one_time',
        provider: 'mercadopago',
        userId: user._id.toString(),
        ...(tierIndex != null ? { preventaTierIndex: tierIndex } : {}),
      },
      payer: {
        email: payerEmail,
        ...(formData.payer?.identification
          ? { identification: formData.payer.identification }
          : {}),
      },
      notification_url: `${origin.replace(/\/$/, '')}/api/payments/course/mercadoPagoWebhook`,
    };

    if (token) {
      paymentPayload.token = token;
      paymentPayload.installments = installments > 0 ? installments : 1;
      if (paymentMethodId) paymentPayload.payment_method_id = paymentMethodId;
      if (issuerId != null && issuerId !== '') paymentPayload.issuer_id = issuerId;
    } else if (paymentMethodId) {
      paymentPayload.payment_method_id = paymentMethodId;
      paymentPayload.installments = installments > 0 ? installments : 1;
    } else {
      // Preferencia / wallet: reenviar formData tal cual cuando aplica
      Object.assign(paymentPayload, formData);
      paymentPayload.transaction_amount = amountFromBrick;
      paymentPayload.external_reference = externalReference;
    }

    // Payments API (MLU) no acepta currency_id en el body; la moneda sale de la cuenta.
    delete paymentPayload.currency_id;
    delete paymentPayload.currencyId;

    const paymentResponse = await mercadoPagoApi.post('/v1/payments', paymentPayload, {
      headers: {
        'X-Idempotency-Key': randomUUID(),
      },
    });

    const payment = paymentResponse.data as {
      id?: string | number;
      status?: string;
      status_detail?: string;
      transaction_amount?: number;
      currency_id?: string;
      payer?: { email?: string };
    };

    const status = String(payment?.status || '');
    const paymentId = String(payment?.id || '');

    coursePaymentDebug('mercadopago_brick.payment_created', {
      paymentId,
      status,
      statusDetail: payment?.status_detail,
    });

    if (isMercadoPagoPaidStatus(status)) {
      const result = await fulfillCoursePurchase({
        productId,
        provider: 'mercadopago',
        transactionId: paymentId,
        email: payment?.payer?.email || payerEmail,
        userId: user._id.toString(),
        amount: payment?.transaction_amount || amountFromBrick,
        moneda: payment?.currency_id || 'UYU',
      });

      if (isCursoEnPreventa(product.cursoConfig) && tierIndex != null) {
        await incrementCursoPreventaCupo(productId, tierIndex, paymentId);
      }

      return NextResponse.json({
        success: true,
        status,
        paymentId,
        redirectUrl: buildCursoMercadoPagoSuccessUrl(origin, productId),
        ...result,
      });
    }

    if (status === 'pending' || status === 'in_process') {
      return NextResponse.json({
        success: true,
        status,
        statusDetail: payment?.status_detail,
        paymentId,
        redirectUrl: buildCursoMercadoPagoSuccessUrl(origin, productId),
      });
    }

    const rejectMessage = messageFromMercadoPagoStatusDetail(
      payment?.status_detail,
      'El pago no fue aprobado'
    );

    return NextResponse.json(
      {
        error: rejectMessage,
        status,
        statusDetail: payment?.status_detail,
        paymentId,
      },
      { status: 402 }
    );
  } catch (error: unknown) {
    const message = getMercadoPagoApiErrorMessage(error);
    const status = getMercadoPagoApiStatus(error);
    coursePaymentWarn('mercadopago_brick.failed', {
      message,
      status,
    });
    return NextResponse.json({ error: message }, { status });
  }
}
