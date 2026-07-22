import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import MentorshipPlan from '../../../../../models/mentorshipPlanModel';
import User from '../../../../../models/userModel';
import mercadoPagoApi, { isMercadoPagoPaidStatus } from '../../mercadoPagoConfig';
import { fulfillMentorshipPurchase } from '../fulfillMentorshipPurchase';
import { buildMentorshipMercadoPagoExternalRef } from '../../../../../lib/resolveMentorshipMercadoPagoExternalRef';
import { buildMentorshipMercadoPagoSuccessUrl } from '../../../../../lib/mentorshipPaymentUrls';
import { coursePaymentDebug, coursePaymentWarn } from '../../../../../lib/coursePaymentDebug';
import { isProveedorHabilitado } from '../../../../../constants/paymentProveedores';
import {
  getMercadoPagoApiErrorMessage,
  getMercadoPagoApiStatus,
  messageFromMercadoPagoStatusDetail,
} from '../../../../../lib/mercadoPagoErrors';

export const runtime = 'nodejs';

type BrickBody = {
  planId?: string;
  interval?: string;
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

    const user = await User.findById(decoded.userId || decoded._id).select('email name');
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) as BrickBody;
    const planId = String(body.planId || '').trim();
    const interval = String(body.interval || '').trim();
    const formData = body.formData || {};

    if (!planId || !interval) {
      return NextResponse.json({ error: 'planId e interval son requeridos' }, { status: 400 });
    }

    const plan = await MentorshipPlan.findById(planId);
    if (!plan || !plan.active) {
      return NextResponse.json({ error: 'Plan no disponible' }, { status: 404 });
    }

    if (!isProveedorHabilitado(plan.proveedoresHabilitados, 'mercadopago')) {
      return NextResponse.json(
        { error: 'Mercado Pago no está habilitado para este plan' },
        { status: 400 }
      );
    }

    const priceEntry = plan.prices?.find((p: { interval: string }) => p.interval === interval);
    if (!priceEntry) {
      return NextResponse.json({ error: 'Intervalo no encontrado' }, { status: 404 });
    }

    const amountFromBrick = Number(
      formData.transaction_amount ?? formData.transactionAmount ?? priceEntry.price
    );
    if (!amountFromBrick || amountFromBrick <= 0) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
    }

    const paymentMethodId = formData.payment_method_id || formData.paymentMethodId;
    const installments = Number(formData.installments || 1);
    const token = formData.token;
    const issuerId = formData.issuer_id ?? formData.issuerId;
    const payerEmail = formData.payer?.email || user.email;
    const externalReference = buildMentorshipMercadoPagoExternalRef(
      planId,
      interval,
      Date.now().toString(36)
    );

    const origin =
      process.env.NEXT_PUBLIC_BASE_URL ||
      req.headers.get('origin') ||
      'http://localhost:3000';

    const paymentPayload: Record<string, unknown> = {
      transaction_amount: amountFromBrick,
      description: `${plan.name} (${interval})`,
      external_reference: externalReference,
      metadata: {
        planId,
        interval,
        type: 'mentorship',
        provider: 'mercadopago',
        userId: user._id.toString(),
      },
      payer: {
        email: payerEmail,
        ...(formData.payer?.identification
          ? { identification: formData.payer.identification }
          : {}),
      },
      notification_url: `${origin.replace(/\/$/, '')}/api/payments/mentorship/mercadoPagoWebhook`,
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
      Object.assign(paymentPayload, formData);
      paymentPayload.transaction_amount = amountFromBrick;
      paymentPayload.external_reference = externalReference;
    }

    // Payments API (MLU) no acepta currency_id en el body; la moneda sale de la cuenta.
    delete paymentPayload.currency_id;
    delete paymentPayload.currencyId;

    coursePaymentDebug('mentorship.mercadopago_brick.process', {
      planId,
      interval,
      amount: amountFromBrick,
      paymentMethodId,
    });

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

    coursePaymentDebug('mentorship.mercadopago_brick.payment_result', {
      planId,
      interval,
      paymentId,
      status,
      statusDetail: payment?.status_detail,
      amount: payment?.transaction_amount || amountFromBrick,
    });

    if (isMercadoPagoPaidStatus(status)) {
      const result = await fulfillMentorshipPurchase({
        planId,
        interval,
        provider: 'mercadopago',
        transactionId: paymentId,
        email: payment?.payer?.email || payerEmail,
        userId: user._id.toString(),
        orderId: externalReference,
        amount: payment?.transaction_amount || amountFromBrick,
        moneda: payment?.currency_id || 'UYU',
      });

      return NextResponse.json({
        success: true,
        status,
        paymentId,
        redirectUrl: buildMentorshipMercadoPagoSuccessUrl(origin, planId, interval, {
          userId: user._id.toString(),
          externalRef: externalReference,
        }),
        ...result,
      });
    }

    if (status === 'pending' || status === 'in_process') {
      return NextResponse.json({
        success: true,
        status,
        statusDetail: payment?.status_detail,
        paymentId,
        redirectUrl: buildMentorshipMercadoPagoSuccessUrl(origin, planId, interval, {
          userId: user._id.toString(),
          externalRef: externalReference,
        }),
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
    coursePaymentWarn('mentorship.mercadopago_brick.failed', {
      message,
      status,
    });
    return NextResponse.json({ error: message }, { status });
  }
}
