import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import MentorshipPlan from '../../../../../models/mentorshipPlanModel';
import { ensureMentorshipPlanPaymentLinks } from '../../../../../lib/createMentorshipPaymentLinks';
import {
  mentorshipPricesHaveStaleLinks,
  resolveMentorshipPaymentOrigin,
} from '../../../../../lib/resolveMentorshipPaymentOrigin';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { planId, forceRegenerate = false } = body;

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID es requerido' }, { status: 400 });
    }

    const plan = await MentorshipPlan.findById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Plan de mentoría no encontrado' }, { status: 404 });
    }

    const origin = resolveMentorshipPaymentOrigin(request);
    const hadStaleLinks = mentorshipPricesHaveStaleLinks(plan.prices, origin);

    const pricesWithLinks = await ensureMentorshipPlanPaymentLinks(plan, origin, {
      forceRegenerate,
    });

    await MentorshipPlan.findByIdAndUpdate(planId, { $set: { prices: pricesWithLinks } });

    const paymentLinks: Record<string, { stripe?: string; dlocalgo?: string }> = {};

    for (const price of pricesWithLinks) {
      paymentLinks[price.interval] = {
        stripe: price.opcionesPago?.find((o) => o.proveedor === 'stripe')?.paymentLink,
        dlocalgo: price.opcionesPago?.find((o) => o.proveedor === 'dlocalgo')?.paymentLink,
      };
    }

    return NextResponse.json({
      success: true,
      paymentLinks,
      prices: pricesWithLinks,
      planName: plan.name,
      originUsed: origin,
      hadStaleLinks,
      regeneratedBecauseStale: hadStaleLinks && !forceRegenerate,
    });
  } catch (error) {
    console.error('Error generando payment links de mentoría:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 },
    );
  }
}
