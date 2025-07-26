import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../payments/stripe/stripeConfig';
import { getCurrentURL } from '../../../assets/getCurrentURL';
import connectDB from '../../../../../config/connectDB';
import MentorshipPlan from '../../../../../models/mentorshipPlanModel';
import User from '../../../../../models/userModel';

export async function POST(request: NextRequest) {
  try {
  
    
    await connectDB();
    const body = await request.json();
    const { planId, userEmail, interval } = body;

    

    // Buscar el plan de mentoría
    const plan = await MentorshipPlan.findById(planId);
    // Buscar el stripePriceId correcto según el intervalo
    const priceObj = plan?.prices?.find((p: any) => p.interval === interval);
    if (!priceObj) {
      return NextResponse.json({ error: 'No se encontró el precio para el intervalo seleccionado' }, { status: 400 });
    }

    
    if (!plan) {
      return NextResponse.json({ error: 'Plan de mentoría no encontrado' }, { status: 404 });
    }

    // Buscar el usuario
    const user = await User.findOne({ email: userEmail });

    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar que el plan esté activo
    if (!plan.active) {

      return NextResponse.json({ error: 'Plan no disponible' }, { status: 400 });
    }

    const origin = getCurrentURL();
    const successUrl = new URL(`${origin}/mentorship/success`);
    successUrl.searchParams.append("external_id", user._id);
    successUrl.searchParams.append("plan_id", planId);



    // Crear sesión de checkout de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceObj.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl.toString(),
      cancel_url: `${origin}/mentorship`,
      customer_email: userEmail,
      metadata: {
        email: userEmail,
        planId: planId,
        planName: plan.name,
        planLevel: plan.level,
        interval: interval,
        type: 'mentorship'
      },
      subscription_data: {
        metadata: {
          planId: planId,
          planName: plan.name,
          planLevel: plan.level,
          interval: interval,
          type: 'mentorship'
        }
      }
    });



    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
      success: true 
    });

  } catch (error) {
    console.error('Error creando sesión de checkout de mentoría:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 