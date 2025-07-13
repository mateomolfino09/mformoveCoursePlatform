import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from './stripeConfig'; // Asegúrate de tener la configuración de Stripe

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { session_id } = req.query; // Obtiene el session_id desde la URL

    if (!session_id || typeof session_id !== 'string') {
        return res.status(400).json({ error: 'Falta el session_id' });
    }

    try {
        // 🔹 Consultar la sesión en Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        res.status(200).json({
            customer: session.customer_details, // Datos del cliente (nombre, email, etc.)
            subscriptionId: session.subscription, // ID de la suscripción (si es un plan recurrente)
            amount_total: session.amount_total, // Monto total pagado
        });
    } catch (error) {
        console.error('Error obteniendo la sesión de Stripe:', error);
        res.status(500).json({ error: 'Error obteniendo los datos de la sesión' });
    }
}