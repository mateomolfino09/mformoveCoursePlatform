import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createStripeSubscription } from '../../createSubscription/createStripeSubscription';
import { updateStripeSubscription } from '../../updateSubscription/updateStripeSubscription';
import { sendSubscriptionEmail } from '../../createSubscription/getSubscriptionEmail';
import { getCurrentURL } from '../../../assets/getCurrentURL';
import { deleteStripeSubscription } from '../../cancelSubscription/deleteStripeSubscription';
import { getLatestSubscriptionStatusByEmail } from '../getSubscriptionStatusByMail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");  // Asegúrate de tener la clave secreta en tus variables de entorno

export const POST = async (req: NextRequest) => {
  if (req.method === 'POST') {
    const sig = headers().get('stripe-signature') as string;
    const body = await req.text();
    let event;
    const origin = getCurrentURL();

    try {
      // Verifica que el webhook proviene de Stripe
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error(`Error al verificar la firma del webhook: ${err?.message}`);
      return new NextResponse("Invalido", {status:400})
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const customer = await stripe.customers.retrieve(session.customer as string);

    if(customer != null) {
      const email = (customer as Stripe.Customer).email;
      const status = await getLatestSubscriptionStatusByEmail(email ?? "")
  
      if(status != null) {
        switch (event.type) {
          case 'customer.subscription.created': {
            const subscriptionCreated = event.data.object;
            
            console.log('CREATE');
        
            try {
              const user = await createStripeSubscription(email ?? "");
              if (status === "trialing") {
                await sendSubscriptionEmail(status, "mateomolfino09@gmail.com", origin);
              }
            } catch (err) {
              console.error("Error al procesar la subscripción creada:", err);
            }
            break;
          }
        
          case 'customer.subscription.updated': {
            const subscriptionUpdated = event.data.object;
            console.log('UPDATE');
        
            try {
              const subscription = await updateStripeSubscription(email ?? "");
              console.log(subscription)

              //al cancelar el estado se mantiene hasta el fin del periodo, por eso chequeamos isCanceled
              subscription?.isCanceled && (status == "trialing" || status == "active")
              ? await sendSubscriptionEmail("canceled", "mateomolfino09@gmail.com", origin)
              : await sendSubscriptionEmail(status, "mateomolfino09@gmail.com", origin)

            } catch (err) {
              console.error("Error al procesar la subscripción actualizada:", err);
            }
            break;
          }
        
          case 'customer.subscription.deleted': {
            const user = await deleteStripeSubscription(email ?? "");
          // Aquí podrías revocar acceso a contenido premium
            break;
          }
        
          default:
            console.log(`Evento no manejado: ${event.type}`);
        }
  
      }
    }

    return new NextResponse("Evento recibido", {status:200})
  } else {
    return new NextResponse("Método no permitido", {status:405})  }
}