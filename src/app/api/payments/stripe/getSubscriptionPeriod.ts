import { stripe } from "./stripeConfig";

const formatDate = (timestamp: number): string => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(timestamp * 1000));
  };

export const getSubscriptionPeriod = async (subscriptionId: string) => {
    try {
      if (!subscriptionId) {
        throw new Error("El ID de la suscripción es requerido.");
      }
  
      // Obtiene los datos de la suscripción
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
      const startDate = formatDate(subscription.current_period_start);
      const endDate = formatDate(subscription.current_period_end);
  
      console.log(`📅 La suscripción comenzó el: ${startDate}`);
      console.log(`⏳ Se renueva o expira el: ${endDate}`);
  
      return { startDate, endDate, subscription };
    } catch (error: any) {
      console.error("❌ Error al obtener la suscripción:", error.message);
      throw new Error(error.message);
    }
  };