import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import MentorshipPlan from '../../../../../models/mentorshipPlanModel';
import User from '../../../../../models/userModel';
import { createMentorshipMercadoPagoPaymentLink } from '../../../../../lib/mentorshipMercadoPagoPaymentLink';
import { resolveMentorshipDlocalCheckoutOrigins } from '../../../../../lib/resolveMentorshipDlocalOrigins';
import { coursePaymentDebug, coursePaymentWarn } from '../../../../../lib/coursePaymentDebug';
import { MERCADO_PAGO_MAX_INSTALLMENTS } from '../../mercadoPagoConfig';
import { isProveedorHabilitado } from '../../../../../constants/paymentProveedores';
import { userHasCuerpoAutonomo } from '../../../../../lib/userHasCuerpoAutonomo';
import {
  resolveCuerpoAutonomoDiscountFromPlan,
  type MentorshipCuerpoAutonomoDiscount,
} from '../../../../../lib/ensureMentorshipCuerpoAutonomoDiscount';
import { applyCuerpoAutonomoDiscount } from '../../../../../constants/mentorshipCuerpoAutonomoDiscount';
import type { MentorshipBillingInterval } from '../../../../../lib/mentorshipPricing';

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
      'email name cursosAdquiridos rol',
    );
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const planId = String(body.planId || '').trim();
    const interval = String(body.interval || '').trim() as MentorshipBillingInterval;

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
        { status: 400 },
      );
    }

    const priceEntry = plan.prices?.find((p: { interval: string }) => p.interval === interval);
    if (!priceEntry) {
      return NextResponse.json({ error: 'Intervalo no encontrado' }, { status: 404 });
    }

    const { successBaseUrl, notificationBaseUrl } =
      resolveMentorshipDlocalCheckoutOrigins(req);

    const elegible = await userHasCuerpoAutonomo(user);
    const applied = elegible
      ? resolveCuerpoAutonomoDiscountFromPlan(
          plan.descuentoCuerpoAutonomo as MentorshipCuerpoAutonomoDiscount | undefined,
          interval,
        )
      : null;

    const basePrice = Number(priceEntry.price);
    const precio = applied ? applyCuerpoAutonomoDiscount(basePrice, interval) : basePrice;

    coursePaymentDebug('mentorship.mercadopago_checkout.regenerate', {
      planId,
      interval,
      successBaseUrl,
      notificationBaseUrl,
      precio,
      precioBase: basePrice,
      discountPercent: applied?.percent,
      discountCode: applied?.code,
      moneda: priceEntry.currency,
      maxInstallments: MERCADO_PAGO_MAX_INSTALLMENTS,
    });

    const created = await createMentorshipMercadoPagoPaymentLink({
      planId,
      interval,
      nombre: applied
        ? `${plan.name} (${interval}) · ${applied.percent}% OFF Cuerpo Autónomo`
        : `${plan.name} (${interval})`,
      descripcion: plan.description || plan.name,
      precio,
      moneda: priceEntry.currency || 'USD',
      origin: successBaseUrl,
      notificationOrigin: notificationBaseUrl,
      orderSuffix: Date.now().toString(36),
      maxInstallments: MERCADO_PAGO_MAX_INSTALLMENTS,
      userId: user._id.toString(),
      payerEmail: user.email,
      discountMeta: applied
        ? {
            discountCode: applied.code,
            discountPercent: applied.percent,
            from: 'cuerpo-autonomo',
            precioBase: basePrice,
          }
        : undefined,
    });

    if (!created.preferenceId) {
      return NextResponse.json(
        { error: 'No se pudo generar la preferencia de Mercado Pago' },
        { status: 502 },
      );
    }

    return NextResponse.json({
      redirectUrl: created.paymentLink,
      preferenceId: created.preferenceId,
      externalReference: created.externalReference,
      amount: created.amount,
      currency: created.currency,
      discountApplied: Boolean(applied),
      discountPercent: applied?.percent ?? 0,
    });
  } catch (error) {
    coursePaymentWarn('mentorship.mercadopago_checkout.failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al iniciar el pago' },
      { status: 500 },
    );
  }
}
