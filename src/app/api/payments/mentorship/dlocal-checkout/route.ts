import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import MentorshipPlan from '../../../../../models/mentorshipPlanModel';
import User from '../../../../../models/userModel';
import { createMentorshipDlocalPaymentLink } from '../../../../../lib/mentorshipDlocalPaymentLink';
import { resolveDlocalLocalizedAmount } from '../../../../../lib/dlocalLocalCurrency';
import { resolvePayerCountry } from '../../../../../lib/resolveRequestCountry';
import { resolveMentorshipDlocalCheckoutOrigins } from '../../../../../lib/resolveMentorshipDlocalOrigins';
import { coursePaymentDebug, coursePaymentWarn } from '../../../../../lib/coursePaymentDebug';

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
      'country mentorship email name',
    );
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const planId = String(body.planId || '').trim();
    const interval = String(body.interval || '').trim();

    if (!planId || !interval) {
      return NextResponse.json({ error: 'planId e interval son requeridos' }, { status: 400 });
    }

    const plan = await MentorshipPlan.findById(planId);
    if (!plan || !plan.active) {
      return NextResponse.json({ error: 'Plan no disponible' }, { status: 404 });
    }

    const priceEntry = plan.prices?.find((p: { interval: string }) => p.interval === interval);
    if (!priceEntry) {
      return NextResponse.json({ error: 'Intervalo no encontrado' }, { status: 404 });
    }

    const payerCountry = resolvePayerCountry(
      String(body.country || user.country || ''),
      req,
    );

    const localized = await resolveDlocalLocalizedAmount({
      amount: Number(priceEntry.price),
      sourceCurrency: priceEntry.currency || 'USD',
      country: payerCountry,
    });

    const { successBaseUrl, notificationBaseUrl } =
      resolveMentorshipDlocalCheckoutOrigins(req);

    coursePaymentDebug('mentorship.dlocal_checkout.regenerate', {
      planId,
      interval,
      payerCountry,
      successBaseUrl,
      notificationBaseUrl,
      originalPrecio: priceEntry.price,
      dlocalPrecio: localized.amount,
      dlocalMoneda: localized.currency,
    });

    const created = await createMentorshipDlocalPaymentLink({
      planId,
      interval,
      nombre: `${plan.name} (${interval})`,
      descripcion: plan.description || plan.name,
      precio: localized.amount,
      moneda: localized.currency,
      origin: successBaseUrl,
      notificationOrigin: notificationBaseUrl,
      orderSuffix: Date.now().toString(36),
      userId: user._id.toString(),
      country: localized.countryCode || payerCountry,
      payer: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });

    if (!created.paymentLink) {
      return NextResponse.json({ error: 'No se pudo generar el checkout de dLocal' }, { status: 502 });
    }

    user.pendingMentorshipDlocal = {
      orderId: created.orderId,
      planId,
      interval,
      createdAt: new Date(),
    };
    await user.save();

    return NextResponse.json({
      redirectUrl: created.paymentLink,
      orderId: created.orderId,
      paymentId: created.paymentId,
    });
  } catch (error) {
    coursePaymentWarn('mentorship.dlocal_checkout.failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al iniciar el pago' },
      { status: 500 },
    );
  }
}
