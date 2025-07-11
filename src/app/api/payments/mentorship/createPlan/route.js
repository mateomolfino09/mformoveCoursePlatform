import connectDB from '../../../../../config/connectDB';
import MentorshipPlan from '../../../../../models/mentorshipPlanModel';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { name, description, features, level, priceTrimestral, currency = 'USD' } = body;
    if (!name || !description || !features || !level || !priceTrimestral) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), { status: 400 });
    }
    // Crear precio trimestral en Stripe
    const stripeTrimestral = await stripe.prices.create({
      unit_amount: Math.round(priceTrimestral * 100),
      currency,
      recurring: { interval: 'month', interval_count: 3 },
      product_data: { name: `${name} (Trimestral)` },
    });
    // Calcular precio anual con 15% de descuento
    const priceAnual = Math.round(priceTrimestral * 4 * 0.85);
    const stripeAnual = await stripe.prices.create({
      unit_amount: Math.round(priceAnual * 100),
      currency,
      recurring: { interval: 'year', interval_count: 1 },
      product_data: { name: `${name} (Anual)` },
    });
    // Guardar en la base de datos
    const plan = await MentorshipPlan.create({
      name,
      description,
      features,
      level,
      prices: [
        {
          interval: 'trimestral',
          price: priceTrimestral,
          currency,
          stripePriceId: stripeTrimestral.id
        },
        {
          interval: 'anual',
          price: priceAnual,
          currency,
          stripePriceId: stripeAnual.id
        }
      ],
      active: true
    });
    return new Response(JSON.stringify({ plan }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al crear el plan de mentoría' }), { status: 500 });
  }
} 