import { getCurrentURL } from '../../assets/getCurrentURL';
import { stripe } from './stripeConfig';
import User from '../../../../models/userModel';
import Promocion from '../../../../models/promocionModel';
import connectDB from '../../../../config/connectDB';

export async function createCheckoutSession(priceId: string, customerEmail?: string, planId?: string, promocionId?: string) {
    const origin = getCurrentURL();
    await connectDB();

    const user = await User.findOne({ email: customerEmail });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const successUrl = new URL(`${origin}/payment/success`);
    const trialPeriodDays = parseInt(process.env.STRIPE_MEMBERSHIP_FREE_DAYS ?? '0', 10) || 0;

    // Buscar promoción activa si se proporciona promocionId
    let stripeCouponId: string | null = null;
    if (promocionId) {
      try {
        const promocion = await Promocion.findById(promocionId);
        if (promocion && promocion.activa && promocion.stripeCouponId) {
          const now = new Date();
          const fechaInicio = new Date(promocion.fechaInicio);
          const fechaFin = new Date(promocion.fechaFin);
          if (fechaInicio <= now && fechaFin >= now) {
            stripeCouponId = promocion.stripeCouponId;
          }
        }
      } catch {
        // Continuar sin cupón si hay error
      }
    }

    const subscriptionData: any = {
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId, // ID del precio en Stripe
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: successUrl.toString(),
        cancel_url: `${origin}/move-crew`,
        customer_email: customerEmail,
        metadata: {
            email: user.email,
            type: 'membership',
            planId: planId || '',
            promocionId: promocionId || ''
        },
        subscription_data: {
            metadata: {
                email: user.email,
                type: 'membership',
                planId: planId || '',
                promocionId: promocionId || ''
            }
        }
    };

    // Aplicar cupón si existe
    if (stripeCouponId) {
        subscriptionData.discounts = [{
            coupon: stripeCouponId
        }];
    }

    if(trialPeriodDays > 0) {
        subscriptionData.subscription_data.trial_period_days = trialPeriodDays;
    }

    try {
        const session = await stripe.checkout.sessions.create(subscriptionData as any);
        return session.url;
    } catch (err) {
        throw new Error(`No se pudo crear la sesión de pago: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
}