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
    } = body;

    const basePrice = priceMensual ?? priceTrimestral;
    const isLegacyTrimestral = priceMensual == null && priceTrimestral != null;

    if (!name || !description || !features || !level || !basePrice) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), { status: 400 });
    }

    let shortInterval;
    let stripeShort;
    let shortPrice;

    if (isLegacyTrimestral) {
      shortInterval = 'trimestral';
      shortPrice = basePrice;
      stripeShort = await stripe.prices.create({
        unit_amount: Math.round(basePrice * 100),
        currency: currency.toLowerCase(),
        recurring: { interval: 'month', interval_count: 3 },
        product_data: { name: `${name} (Trimestral)` },
      });
    } else {
      shortInterval = 'mensual';
      shortPrice = basePrice;
      stripeShort = await stripe.prices.create({
        unit_amount: Math.round(basePrice * 100),
        currency: currency.toLowerCase(),
        recurring: { interval: 'month', interval_count: 1 },
        product_data: { name: `${name} (Mensual)` },
      });
    }

    const priceAnual = Math.round(
      isLegacyTrimestral ? basePrice * 4 * 0.85 : basePrice * 12 * 0.85,
    );

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
      prices: [
        {
          interval: shortInterval,
          price: shortPrice,
          currency,
          stripePriceId: stripeShort.id,
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
