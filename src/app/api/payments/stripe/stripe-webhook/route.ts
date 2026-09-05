import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '../../../../../config/connectDB';
import { constructStripeEvent } from '../../../../../lib/stripeWebhookVerify';
import { handleStripeCourseCheckoutCompleted } from '../../../../../lib/handleStripeCourseCheckout';
import { updateCourseSubscriptionStatus } from '../../course/fulfillCoursePurchase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
connectDB();

export const POST = async (req: NextRequest) => {
  if (req.method === 'POST') {
    const sig = headers().get('stripe-signature') as string;
    const body = await req.text();
    let event;
    try {
      event = constructStripeEvent(stripe, body, sig);
    } catch (err: any) {
      console.error(`Error al verificar la firma del webhook: ${err?.message}`);
      return new NextResponse("Invalido", {status:400})
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleStripeCourseCheckoutCompleted(session);
          break;
        }

        // Renovación: Stripe manda 'updated' con un current_period_end nuevo.
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const isExpired = ['canceled', 'unpaid', 'incomplete_expired'].includes(subscription.status);
          await updateCourseSubscriptionStatus({
            stripeSubscriptionId: subscription.id,
            status: isExpired ? 'expired' : 'active',
            expiresAt: new Date(subscription.current_period_end * 1000),
          });
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await updateCourseSubscriptionStatus({
            stripeSubscriptionId: subscription.id,
            status: 'expired',
          });
          break;
        }

        default:
          break;
      }
    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      return new NextResponse("Error procesando webhook", {status:500});
    }

    return new NextResponse("Evento recibido", {status:200})
  } else {
    return new NextResponse("Método no permitido", {status:405})
  }
}
