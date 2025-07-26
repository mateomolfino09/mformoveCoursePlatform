import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../payments/stripe/stripeConfig';
import { getCurrentURL } from '../../../assets/getCurrentURL';
import connectDB from '../../../../../config/connectDB';
import MentorshipPlan from '../../../../../models/mentorshipPlanModel';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID es requerido' }, { status: 400 });
    }

    // Buscar el plan de mentoría
    const plan = await MentorshipPlan.findById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Plan de mentoría no encontrado' }, { status: 404 });
    }

    const origin = getCurrentURL();
    const successUrl = new URL(`${origin}/mentorship/success`);
    successUrl.searchParams.append("plan_id", planId);

    const paymentLinks: { [key: string]: string } = {};

    // Generar payment links para cada precio del plan
    if (plan.prices && plan.prices.length > 0) {
      for (const price of plan.prices) {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price: price.stripePriceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: successUrl.toString(),
          cancel_url: `${origin}/mentorship`,
          metadata: {
            planId: planId,
            planName: plan.name,
            planLevel: plan.level,
            interval: price.interval,
            type: 'mentorship'
          },
          subscription_data: {
            metadata: {
              planId: planId,
              planName: plan.name,
              planLevel: plan.level,
              interval: price.interval,
              type: 'mentorship'
            }
          }
        });

        paymentLinks[price.interval] = session.url || '';
      }
    } else {
      // Para planes legacy con un solo precio
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl.toString(),
        cancel_url: `${origin}/mentorship`,
        metadata: {
          planId: planId,
          planName: plan.name,
          planLevel: plan.level,
          interval: plan.interval,
          type: 'mentorship'
        },
        subscription_data: {
          metadata: {
            planId: planId,
            planName: plan.name,
            planLevel: plan.level,
            interval: plan.interval,
            type: 'mentorship'
          }
        }
      });

      paymentLinks[plan.interval] = session.url || '';
    }

    return NextResponse.json({ 
      success: true,
      paymentLinks,
      planName: plan.name
    });

  } catch (error) {
    console.error('Error generando payment links de mentoría:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 