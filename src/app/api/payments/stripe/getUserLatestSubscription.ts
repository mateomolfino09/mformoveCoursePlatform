import { stripe } from './stripeConfig';

export async function getLatestSubscription(stripeCustomerId: string) {
    try {
        const subscriptions = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: 'all', // Puedes filtrar por 'active' o 'trialing' si lo necesitas
        });

        if (!subscriptions.data.length) return null;

        // Encontrar la suscripción más reciente
        return subscriptions.data.reduce((max, current) => {
            return new Date(current.created * 1000) > new Date(max.created * 1000) ? current : max;
        }, subscriptions.data[0]);
    } catch (error) {
        console.error('Error obteniendo suscripción de Stripe:', error);
        return null;
    }
}