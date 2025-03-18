import { stripe } from './stripeConfig';

export async function getLatestSubscriptionStatusByEmail(email: string) {
    try {
        const customers = await stripe.customers.list({ email });

        if (!customers.data.length) return null; // No hay cliente con ese email

        const customer = customers.data[0]; // Tomamos el primer cliente encontrado
        const customerId = customer.id;

        // 🔹 2. Buscar suscripciones activas del cliente
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all',
        });

        if (!subscriptions.data.length) return null;

        // 🔹 3. Encontrar la suscripción más reciente
        const latestSub = subscriptions.data.reduce((max, current) => {
            return new Date(current.created * 1000) > new Date(max.created * 1000) ? current : max;
        }, subscriptions.data[0]);

        return latestSub.status;
    } catch (error) {
        console.error('Error obteniendo suscripción de Stripe:', error);
        return null;
    }
}