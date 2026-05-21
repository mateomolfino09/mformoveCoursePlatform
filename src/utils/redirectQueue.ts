import Cookies from 'js-cookie';

const REDIRECT_QUEUE_COOKIE = 'redirectQueue';
const PLAN_INTENT_COOKIE = 'planIntent';
const COURSE_CHECKOUT_INTENT_COOKIE = 'courseCheckoutIntent';
const COOKIE_EXPIRES_DAYS = 1; // 1 día de expiración

export interface PlanIntent {
  planId: string;
  provider: string;
  origin: string;
  plan_token?: string;
}

export type CourseCheckoutPaymentMethod = 'stripe' | 'dlocalgo' | 'transferencia';

export interface CourseCheckoutIntent {
  courseSlug: string;
  selectedMethod: CourseCheckoutPaymentMethod;
  paymentLink?: string;
}

/**
 * Guarda la URL de destino en una cookie para redirigir después del login/registro
 * @param url - URL a donde se quiere redirigir (ej: '/elegir-plan')
 */
export const saveRedirectUrl = (url: string): void => {
  if (typeof window === 'undefined') return;
  
  // Solo guardar si es una URL válida y no es una ruta de auth
  const authRoutes = ['/iniciar-sesion', '/registro', '/verificar-correo', '/restablecer', '/restablecer-correo', '/olvide-contrasena'];
  if (!url || authRoutes.some(route => url.startsWith(route))) {
    return;
  }
  
  Cookies.set(REDIRECT_QUEUE_COOKIE, url, { 
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: 'lax'
  });
};

/**
 * Guarda la intención de seleccionar un plan para ejecutarla después del login/registro
 * @param planIntent - Objeto con la información del plan (planId, provider, origin, plan_token)
 */
export const savePlanIntent = (planIntent: PlanIntent): void => {
  if (typeof window === 'undefined') return;
  
  console.log('[savePlanIntent] Guardando planIntent:', planIntent);
  Cookies.set(PLAN_INTENT_COOKIE, JSON.stringify(planIntent), {
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: 'lax'
  });
  console.log('[savePlanIntent] Cookie guardada. Verificando:', Cookies.get(PLAN_INTENT_COOKIE));
};

/**
 * Obtiene la intención de plan guardada y la elimina de la cookie
 * @returns PlanIntent guardada o null si no hay ninguna
 */
export const getAndClearPlanIntent = (): PlanIntent | null => {
  if (typeof window === 'undefined') return null;
  
  const planIntentStr = Cookies.get(PLAN_INTENT_COOKIE);
  console.log('[getAndClearPlanIntent] Cookie obtenida:', planIntentStr);
  
  if (planIntentStr) {
    try {
      const planIntent = JSON.parse(planIntentStr) as PlanIntent;
      Cookies.remove(PLAN_INTENT_COOKIE);
      console.log('[getAndClearPlanIntent] planIntent parseado:', planIntent);
      return planIntent;
    } catch (error) {
      console.error('[getAndClearPlanIntent] Error parseando planIntent:', error);
      Cookies.remove(PLAN_INTENT_COOKIE);
      return null;
    }
  }
  
  console.log('[getAndClearPlanIntent] No hay cookie guardada');
  return null;
};

/**
 * Solo obtiene la intención de plan guardada sin eliminarla (útil para verificar)
 * @returns PlanIntent guardada o null si no hay ninguna
 */
export const getPlanIntent = (): PlanIntent | null => {
  if (typeof window === 'undefined') return null;
  
  const planIntentStr = Cookies.get(PLAN_INTENT_COOKIE);
  
  if (planIntentStr) {
    try {
      return JSON.parse(planIntentStr) as PlanIntent;
    } catch (error) {
      return null;
    }
  }
  
  return null;
};

/**
 * Obtiene la URL guardada y la elimina de la cookie
 * @returns URL guardada o null si no hay ninguna
 */
export const getAndClearRedirectUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const url = Cookies.get(REDIRECT_QUEUE_COOKIE);
  
  if (url) {
    // Eliminar la cookie después de leerla
    Cookies.remove(REDIRECT_QUEUE_COOKIE);
    return url;
  }
  
  return null;
};

/**
 * Solo obtiene la URL guardada sin eliminarla (útil para verificar)
 * @returns URL guardada o null si no hay ninguna
 */
export const getRedirectUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  return Cookies.get(REDIRECT_QUEUE_COOKIE) || null;
};

export const saveCourseCheckoutIntent = (intent: CourseCheckoutIntent): void => {
  if (typeof window === 'undefined') return;

  Cookies.set(COURSE_CHECKOUT_INTENT_COOKIE, JSON.stringify(intent), {
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: 'lax',
  });
};

export const getCourseCheckoutIntent = (): CourseCheckoutIntent | null => {
  if (typeof window === 'undefined') return null;

  const raw = Cookies.get(COURSE_CHECKOUT_INTENT_COOKIE);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CourseCheckoutIntent;
  } catch {
    return null;
  }
};

export const getAndClearCourseCheckoutIntent = (): CourseCheckoutIntent | null => {
  const intent = getCourseCheckoutIntent();
  if (intent) {
    Cookies.remove(COURSE_CHECKOUT_INTENT_COOKIE);
  }
  return intent;
};

/** Acciones guardadas en cookies que se pierden al cerrar sesión. */
export function getPendingUserActions(): string[] {
  if (typeof window === 'undefined') return [];

  const actions: string[] = [];

  if (getPlanIntent()) {
    actions.push('Selección de plan de membresía pendiente');
  }

  const checkout = getCourseCheckoutIntent();
  if (checkout) {
    const slug = checkout.courseSlug?.trim();
    actions.push(
      slug
        ? `Compra del curso «${slug.replace(/-/g, ' ')}» en curso`
        : 'Compra de curso en curso'
    );
  }

  const redirect = getRedirectUrl();
  if (redirect && !checkout) {
    actions.push('Continuación de navegación guardada para después del login');
  }

  return actions;
}

export function clearPendingUserActions(): void {
  if (typeof window === 'undefined') return;
  getAndClearPlanIntent();
  getAndClearCourseCheckoutIntent();
  getAndClearRedirectUrl();
}

