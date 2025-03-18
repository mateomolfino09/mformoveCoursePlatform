import { stripe } from '../stripe/stripeConfig';


export const cancelStripeSubscription = async (subscriptionId: string) => {
    try {
      if (!subscriptionId) {
        throw new Error("El ID de la suscripción es requerido.");
      }
    // Cancela la suscripción inmediatamente
    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true, // La suscripción se cancela cuando finaliza el período actual
    });
  
      console.log("✅ Suscripción cancelada:", canceledSubscription.id);
      return canceledSubscription;
    } catch (error: any) {
      console.error("❌ Error al cancelar la suscripción:", error.message);
      throw new Error(error.message);
    }
  };