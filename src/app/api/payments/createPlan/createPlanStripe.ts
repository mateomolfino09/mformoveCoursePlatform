import connectDB from '../../../../config/connectDB';
import dLocalApi from '../dlocalConfig';
import Plan from '../../../../models/planModel';
import { stripe } from '../stripe/stripeConfig';
import { getCurrentURL } from '../../assets/getCurrentURL';
import { createCheckoutSession } from '../stripe/createCheckoutSession';

connectDB();

interface Props {
    name: string,
    currency: string,
    description: string,
    amount: number,
    amountAnual: number,

}

export async function createPlanStripe({name,
    currency,
    description,
    amount,
    amountAnual}: Props) {
    let origin = getCurrentURL();

  try {
    const product = await stripe.products.create({
        name,
        description
    });

    // Crear precio (plan de suscripción)
    const price = await stripe.prices.create({
        unit_amount: amount * 100, // Stripe usa centavos
        currency,
        recurring: { interval: 'month' }, // 'monthly' o 'yearly'
        product: product.id,
        billing_scheme: 'per_unit',
    });

    const priceAnual = await stripe.prices.create({
      unit_amount: amountAnual * 100, // Stripe usa centavos
      currency,
      recurring: { interval: 'year' }, // 'monthly' o 'yearly'
      product: product.id,
      billing_scheme: 'per_unit',
  });

  let newPlan = await new Plan({
        id: price.id,
        name: `${name} Mensual`,
        description,
        currency,
        amount: amount,
        frequency_type: 'month',
        frequency_value: 1,
        frequency_label: 'Mensual',
        active: true,
        plan_token: price.id, // ID del precio de Stripe
        success_url: `${origin}/payment/success`,
        error_url: `${origin}/payment/error`,
        back_url: `${origin}/payment/back`,
        provider: "stripe"
    }).save();

    let newPlanAnual = await new Plan({
      id: priceAnual.id,
      name: `${name} Anual`,
      description,
      currency,
      amount: amountAnual,
      frequency_type: 'year',
      frequency_value: 1,
      frequency_label: 'Anual',
      active: true,
      plan_token: priceAnual.id, // ID del precio de Stripe
      success_url: `${origin}/payment/success`,
      error_url: `${origin}/payment/error`,
      back_url: `${origin}/payment/back`,
      provider: "stripe"

  }).save();

      return newPlan;
  } catch (err) {
    }
}