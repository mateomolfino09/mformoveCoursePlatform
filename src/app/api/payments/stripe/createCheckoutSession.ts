import { getCurrentURL } from '../../assets/getCurrentURL';
import { stripe } from './stripeConfig';
import User from '../../../../models/userModel';

export async function createCheckoutSession(priceId: string, customerEmail?: string) {
    let origin = getCurrentURL();
    const user = await User.findOne({ email: customerEmail })
    const successUrl = new URL(`${origin}/payment/success`);
    successUrl.searchParams.append("external_id", user._id); // Agrega el user._id como parámetro
    console.log(user, 'Hola soy el usuario')
    const trialPeriodDays = parseInt(process.env.STRIPE_MEMBERSHIP_FREE_DAYS ?? '0', 10) || 0;

    const subscriptionData: any = {
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId, // ID del precio en Stripe
                quantity: 1,
            },
        ],
        mode: 'subscription', // Modo suscripción
        success_url: successUrl.toString(), // Usa la URL con el parámetro agregado
        cancel_url: `${origin}/payment/cancel`,
        customer_email: customerEmail, // Opcional, para precargar el email del cliente
        metadata: {
            email: user.email
        }
    }

    if(trialPeriodDays > 0) {
        subscriptionData.subscription_data.trial_period_days = trialPeriodDays
    }

    try {
        const session = await stripe.checkout.sessions.create(subscriptionData as any);

        return session.url; // URL de pago de Stripe
    } catch (err) {
        console.error('Error creando la sesión de pago:', err);
        throw new Error('No se pudo crear la sesión de pago.');
    }
}