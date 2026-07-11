import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '../../../../../config/connectDB';
import { fulfillMentorshipPurchase } from '../../../payments/mentorship/fulfillMentorshipPurchase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
const User = require('../../../../../models/userModel');

export async function POST(req: NextRequest) {
  if (req.method === 'POST') {
    const sig = headers().get('stripe-signature') as string;
    const body = await req.text();
    let event;

    try {
      // Verifica que el webhook proviene de Stripe
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error(`Error al verificar la firma del webhook: ${err?.message}`);
      return new NextResponse("Invalido", { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Solo procesar eventos relacionados con mentoría
    if (session.metadata?.type !== 'mentorship') {
      return new NextResponse("Evento no relacionado con mentoría", { status: 200 });
    }

    try {
      connectDB();

      switch (event.type) {
        case 'checkout.session.completed': {
          const customer = await stripe.customers.retrieve(session.customer as string);
          const email = (customer as Stripe.Customer).email;

          if (email && session.metadata?.planId) {
            await fulfillMentorshipPurchase({
              planId: session.metadata.planId,
              interval: session.metadata.interval || 'mensual',
              provider: 'stripe',
              transactionId: String(session.subscription || session.payment_intent || session.id),
              email,
            });
          }
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          const email = (customer as Stripe.Customer).email;

          if (email) {
            const user = await User.findOne({ email });
            if (user && user.mentorship) {
              user.mentorship.status = subscription.status;
              user.mentorship.lastPaymentDate = new Date();
              
              if (subscription.status === 'canceled') {
                user.mentorship.active = false;
              }
              
              await user.save();
      
            }
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          const email = (customer as Stripe.Customer).email;

          if (email) {
            const user = await User.findOne({ email });
            if (user && user.mentorship) {
              user.mentorship.active = false;
              user.mentorship.status = 'canceled';
              await user.save();
      
            }
          }
          break;
        }

        default:
  
      }

      return new NextResponse("Evento procesado", { status: 200 });
    } catch (error) {
      console.error('Error procesando webhook de mentoría:', error);
      return new NextResponse("Error interno", { status: 500 });
    }
  } else {
    return new NextResponse("Método no permitido", { status: 405 });
  }
} 