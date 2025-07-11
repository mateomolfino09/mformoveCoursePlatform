import dbConnect from '../../../../../../config/mongodb';
import MembershipPlan from '../../../../../../models/membershipPlanModel';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  await dbConnect();
  try {
    const { name, description, features, level, price, currency = 'USD', interval = 'month' } = req.body;
    if (!name || !description || !features || !level || !price) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    // Crear precio en Stripe
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(price * 100),
      currency,
      recurring: { interval },
      product_data: { name },
    });
    // Guardar en la base de datos
    const plan = await MembershipPlan.create({
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
    return res.status(201).json({ plan });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al crear el plan de membresía' });
  }
} 