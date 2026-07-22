import connectDB from '../../../../../config/connectDB';
import MentorshipPlan from '../../../../../models/mentorshipPlanModel';
import { ensureMentorshipPlanPaymentLinks } from '../../../../../lib/createMentorshipPaymentLinks';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function resolveOrigin(req) {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    req.headers.get('origin') ||
    'http://localhost:3000'
  );
}

/** A partir de ahora: ciclo corto = 3 meses (trimestral) + anual (−15%). */
export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const {
      name,
      description,
      features,
      level,
      priceMensual,
      priceTrimestral,
      currency = 'USD',
      proveedoresHabilitados,
    } = body;

    const shortPrice =
      priceTrimestral != null && priceTrimestral !== ''
        ? Number(priceTrimestral)
        : priceMensual != null && priceMensual !== ''
          ? Math.round(Number(priceMensual) * 3)
          : NaN;

    if (!name || !description || !features || !level || !shortPrice || shortPrice <= 0) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), { status: 400 });
    }

    const stripeTrimestral = await stripe.prices.create({
      unit_amount: Math.round(shortPrice * 100),
      currency: currency.toLowerCase(),
      recurring: { interval: 'month', interval_count: 3 },
      product_data: { name: `${name} (Trimestral)` },
    });

    const priceAnual = Math.round(shortPrice * 4 * 0.85);

    const stripeAnual = await stripe.prices.create({
      unit_amount: Math.round(priceAnual * 100),
      currency: currency.toLowerCase(),
      recurring: { interval: 'year', interval_count: 1 },
      product_data: { name: `${name} (Anual)` },
    });

    await MentorshipPlan.updateMany({ active: true }, { $set: { active: false } });

    let plan = await MentorshipPlan.create({
      name,
      description,
      features,
      level,
      proveedoresHabilitados:
        Array.isArray(proveedoresHabilitados) && proveedoresHabilitados.length
          ? proveedoresHabilitados
          : ['stripe', 'mercadopago'],
      prices: [
        {
          interval: 'trimestral',
          price: shortPrice,
          currency,
          stripePriceId: stripeTrimestral.id,
        },
        {
          interval: 'anual',
          price: priceAnual,
          currency,
          stripePriceId: stripeAnual.id,
        },
      ],
      active: true,
    });

    const origin = resolveOrigin(req);
    const pricesWithLinks = await ensureMentorshipPlanPaymentLinks(plan, origin, {
      forceRegenerate: true,
    });

    plan = await MentorshipPlan.findByIdAndUpdate(
      plan._id,
      { $set: { prices: pricesWithLinks } },
      { new: true },
    );

    return new Response(JSON.stringify({ plan }), { status: 201 });
  } catch (error) {
    console.error('Error al crear plan de mentoría:', error);
    return new Response(
      JSON.stringify({
        error: 'Error al crear el plan de mentoría',
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 },
    );
  }
}
