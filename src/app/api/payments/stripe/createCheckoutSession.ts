import { getCurrentURL } from '../../assets/getCurrentURL';
import { stripe } from './stripeConfig';
import User from '../../../../models/userModel';

export async function createCheckoutSession(priceId: string, customerEmail?: string) {
    let origin = getCurrentURL();
    const user = await User.findOne({ email: customerEmail })
    const successUrl = new URL(`${origin}/payment/success`);
    successUrl.searchParams.append("external_id", user._id); // Agrega el user._id como parámetro
    console.log(user, 'Hola soy el usuario')

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId, // ID del precio en Stripe
                    quantity: 1,
                },
            ],
            mode: 'subscription', // Modo suscripción
            subscription_data: {
                trial_period_days: 7,
            },
            success_url: successUrl.toString(), // Usa la URL con el parámetro agregado
            cancel_url: `${origin}/payment/cancel`,
            customer_email: customerEmail, // Opcional, para precargar el email del cliente
            metadata: {
                email: user.email
            }
        });

        return session.url; // URL de pago de Stripe
    } catch (err) {
        console.error('Error creando la sesión de pago:', err);
        throw new Error('No se pudo crear la sesión de pago.');
    }
}