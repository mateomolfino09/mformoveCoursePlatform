import connectDB from '../config/connectDB';
import CourseClass from '../models/courseClassModel';
import CourseClassProgress from '../models/courseClassProgressModel';
import ProductAccess from '../models/productAccessModel';

export type SessionUser = { _id: string | { toString(): string }; rol?: string } | null;

/**
 * Auto-enroll idempotente. Se llama en TODO GET autenticado (producto o clase).
 * Admin no necesita fila de ProductAccess — bypass directo por rol en isClassUnlocked/canAccessProduct,
 * igual que userHasCourseAccess, pero igualmente se otorga la fila para simplificar queries de progreso.
 */
export async function ensureProductAccess(userId: string, productId: string): Promise<void> {
  await connectDB();
  await ProductAccess.findOneAndUpdate(
    { userId, productId },
    { $setOnInsert: { grantedAt: new Date() } },
    { upsert: true }
  );
}

/**
 * ¿El usuario puede ver el listado del producto / la Clase 1?
 * Solo chequea autenticación. Ningún chequeo de fecha ni de "publicado" para el usuario final —
 * secuenciaConfig.publicado es un toggle de admin que se resuelve a nivel de query (404 si no publicado),
 * no un "reason" de bloqueo por usuario.
 */
export function canAccessProduct(user: SessionUser): { ok: boolean; reason?: 'no_auth' } {
  if (!user) return { ok: false, reason: 'no_auth' };
  return { ok: true };
}

/**
 * ¿Se puede ABRIR la clase `targetOrder` vía su URL (p. ej. link del mail)?
 *
 * Flujo de nurturing por email — dos requisitos:
 * 1) Primera clase (sin `order` menor): siempre accesible con sesión.
 * 2) Clase N: existe CourseClassProgress en la clase inmediatamente anterior (order actual).
 *
 * Esto NO significa que N aparezca "desbloqueada" en el listado al mirar N-1.
 * En el listado, N solo se revela cuando el usuario ya entró a la URL de N
 * (tiene progreso propio). Ver `isClassRevealedInList`.
 */
export async function isClassUnlocked(
  userId: string,
  productId: string,
  targetOrder: number
): Promise<boolean> {
  await connectDB();

  const previousClass = await CourseClass.findOne({
    productId,
    order: { $lt: targetOrder },
  })
    .sort({ order: -1 })
    .select('_id')
    .lean();

  if (!previousClass) {
    // Es la primera clase (o no hay ninguna con order menor): siempre accesible.
    return true;
  }

  const progress = await CourseClassProgress.findOne({
    userId,
    courseClassId: previousClass._id,
  })
    .select('_id')
    .lean();

  return !!progress;
}

/**
 * ¿La clase debe mostrarse como desbloqueada en el listado / nav?
 * - Primera clase: siempre.
 * - Resto: solo si el usuario ya entró a ESA clase (tiene CourseClassProgress propio).
 *   Haber pasado por la anterior no alcanza — hace falta el link de la clase (mail).
 */
export function isClassRevealedInList(opts: {
  isFirst: boolean;
  hasOwnProgress: boolean;
}): boolean {
  return opts.isFirst || opts.hasOwnProgress;
}

export function freeSequentialBlockedMessage(reason: 'no_auth' | 'locked'): string {
  if (reason === 'no_auth') return 'Iniciá sesión para acceder a este contenido.';
  return 'Esta clase todavía no está disponible. Revisá tu mail o completá la clase anterior.';
}
