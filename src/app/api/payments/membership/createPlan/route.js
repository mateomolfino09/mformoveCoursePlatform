import connectDB from '../../../../../config/connectDB.js';
import Plan from '../../../../../models/planModel';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { name, description, features, level, price, currency = 'USD', interval = 'month' } = body;
    if (!name || !description || !features || !level || !price) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), { status: 400 });
    }
    // Crear precio en Stripe
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(price * 100),
      currency,
      recurring: { interval },
      product_data: { name },
    });
    // Guardar en la base de datos
    const plan = await Plan.create({
      name,
      description,
      features,
      level,
      price,
      currency,
      interval,
      stripePriceId: stripePrice.id,
      active: true
    });
    return new Response(JSON.stringify({ plan }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al crear el plan de membresía' }), { status: 500 });
  }
} 