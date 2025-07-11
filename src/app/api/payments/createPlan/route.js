import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import MentorshipPlan from '../../../../models/mentorshipPlanModel';
import dLocalApi from '../dlocalConfig';
import { verify } from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';
import { getCurrentURL } from '../../assets/getCurrentURL';
import { NextResponse } from 'next/server';
import { stripe } from '../stripe/stripeConfig';
import { createPlanDlocal } from './createPlanDLocal';
import { createPlanStripe } from './createPlanStripe';

connectDB();

export async function POST(req) {
    const {
        name, description, currency, amount, amountAnual, frequency_type, useStripe, planType = 'membership', 
        interval, level, features, active = true
        } = await req.json();  
  try { 

    if (req.method === 'POST') {
      // Determinar qué modelo usar basado en planType
      const PlanModel = planType === 'mentorship' ? MentorshipPlan : Plan;
      
      if(useStripe) {
        //CASO STRIPE
        if (planType === 'mentorship') {
          // 1. Crear producto en Stripe con el nombre del plan
          const product = await stripe.products.create({
            name,
            description: description || undefined,
            metadata: {
              type: 'mentorship',
              level: level || 'explorer',
            }
          });

          // 2. Crear precio en Stripe (trimestral)
          const stripePrice = await stripe.prices.create({
            unit_amount: Math.round(amount * 100), // Stripe espera centavos
            currency: currency || 'usd',
            recurring: { interval: 'month', interval_count: 3 }, // Trimestral
            product: product.id,
          });

          // 3. Crear el plan en MongoDB con el stripePriceId real
          const newPlan = new PlanModel({
            name,
            price: amount,
            currency: currency || 'USD',
            interval: 'trimestral',
            description,
            features: features || [],
            level: level || 'explorer',
            stripePriceId: stripePrice.id,
            active
          });
          
          await newPlan.save();
          
          return NextResponse.json(
            { success: true, newPlan, message: 'Plan de mentoría creado con éxito' },
            { status: 200 }
          );
        } else {
          // Plan de membresía original
          let plan = await createPlanStripe({name,
            currency,
            description,
            amount,
            amountAnual})

          return NextResponse.json(
            { success: true, newPlan: plan, message: 'Plan creado con éxito' },
            { status: 200 }
          );
        }

      } else {
        //CASO DLOCAL
        if (planType === 'mentorship') {
          return NextResponse.json(
            { error: 'Los planes de mentoría solo soportan Stripe' },
            { status: 400 }
          );
        } else {
          let plan = createPlanDlocal({name,
            currency,
            description,
            amount,
            frequency_type})
      
          return NextResponse.json(
            { success: true, newPlan: plan, message: 'Plan creado con éxito' },
            { status: 200 }
          );
        }
      }

    } else {
      return NextResponse.json({ error: 'El metodo no fue post' }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message || err }, { status: 401 });
  }
}
