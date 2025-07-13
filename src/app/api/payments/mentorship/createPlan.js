import dbConnect from '../../../../config/mongodb';
import MentorshipPlan from '../../../../models/mentorshipPlanModel';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  await dbConnect();
  try {
    const { name, description, features, level, priceTrimestral, currency = 'USD' } = req.body;
    if (!name || !description || !features || !level || !priceTrimestral) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
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
    return res.status(201).json({ plan });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al crear el plan de mentoría' });
  }
} 