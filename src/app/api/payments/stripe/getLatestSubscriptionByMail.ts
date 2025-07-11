import { stripe } from './stripeConfig';

export async function getLatestSubscriptionByEmail(email: string) {
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

           // 📌 Detectar si la suscripción está cancelada pero aún en trial o activa
        const isCanceled = latestSub.cancel_at_period_end;
        const canceledAt = latestSub.cancel_at ? new Date(latestSub.cancel_at * 1000) : null;

        return {
            id: latestSub.id,
            planId: latestSub.items.data[0]?.price.id || null,
            subscription_token: latestSub.latest_invoice || null, // No hay un "subscription_token", se usa invoice como referencia
            status: latestSub.status,
            payment_method_code: latestSub.default_payment_method || null,
            client_id: customerId,
            success_url: null, // Stripe no devuelve una success_url, debe manejarse en la app
            client_first_name: customer.name?.split(' ')[0] || '',
            client_last_name: customer.name?.split(' ')[1] || '',
            client_document_type: null, // No disponible en Stripe
            client_document: null, // No disponible en Stripe
            client_email: email,
            created_at: new Date(latestSub.created * 1000),
            active: latestSub.status == "active" || latestSub.status == "trialing" ? true : false,
            isCanceled,
            canceledAt
        };
    } catch (error) {
        console.error('Error obteniendo suscripción de Stripe:', error);
        return null;
    }
}