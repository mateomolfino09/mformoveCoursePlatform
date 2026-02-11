import { getAndClearPlanIntent, PlanIntent } from './redirectQueue';
import endpoints from '../services/api';
import Cookies from 'js-cookie';
import { toast } from '../hooks/useToast';

/**
 * Ejecuta la intención de plan guardada después del login/registro
 * @param userEmail - Email del usuario autenticado
 * @param userId - ID del usuario autenticado
 * @param router - Router de Next.js para redirigir
 * @returns true si se ejecutó una intención, false si no había ninguna
 */
export const executePlanIntent = async (
  userEmail: string,
  userId: string,
  router: any
): Promise<boolean> => {
  console.log('[executePlanIntent] Iniciando con:', { userEmail, userId });
  const planIntent = getAndClearPlanIntent();
  console.log('[executePlanIntent] planIntent:', planIntent);
  
  if (!planIntent) {
    console.log('[executePlanIntent] No hay planIntent guardado');
    return false;
  }
  
  try {
    console.log('[executePlanIntent] Provider:', planIntent.provider);
    if (planIntent.provider !== 'stripe') {
      // Para dLocal u otros proveedores
      const res = await fetch(endpoints.payments.createPaymentToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, planId: planIntent.planId }),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        toast.error(data.message || 'Error al crear el token de pago');
        return true; // Ya se procesó, aunque haya error
      }
      
      const { token, planToken } = data;
      Cookies.set('planToken', planToken ? planToken : '', { expires: 5 });
      
      if (planIntent.plan_token) {
        router.push(`${planIntent.origin}/validate/subscription/${planIntent.plan_token}?external_id=${userId}`);
      } else {
        toast.error('Error: plan_token no disponible');
      }
    } else {
      // Para Stripe
      const res = await fetch(endpoints.payments.stripe.createPaymentURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, planId: planIntent.planId }),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        toast.error(data.message || 'Error al crear la URL de pago');
        return true; // Ya se procesó, aunque haya error
      }
      
      const { url, planToken } = data;
      Cookies.set('planToken', planToken ? planToken : '', { expires: 5 });
      
      router.push(url);
    }
    
    return true;
  } catch (error: any) {
    console.error('Error ejecutando intención de plan:', error);
    toast.error(error?.message || 'Error al procesar el plan');
    return true; // Ya se procesó, aunque haya error
  }
};

