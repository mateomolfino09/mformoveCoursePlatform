/**
 * Chequeo de acceso a un curso desde el cliente, usando el `user` ya cargado por `useAuth()`.
 *
 * El perfil (`/api/user/auth/profile`) popula `cursosAdquiridos.productoId` con
 * `{ _id, nombre, cursoConfig.slug, ... }`, así que acá se matchea por slug en vez de
 * requerir que la landing reciba el `productId` crudo.
 *
 * Espejo simplificado de `src/lib/courseAccess.ts` (server-only) — mantener la lógica de
 * vigencia (`status`/`expiresAt`) en sync si esa cambia.
 */

type CursoAdquiridoProductoPopulado = {
  _id?: string;
  cursoConfig?: { slug?: string } | null;
} | string | null | undefined;

type CursoAdquiridoClient = {
  productoId?: CursoAdquiridoProductoPopulado;
  status?: 'active' | 'expired' | 'revoked';
  expiresAt?: string | Date | null;
};

type UserWithCursosAdquiridos = {
  rol?: string;
  cursosAdquiridos?: CursoAdquiridoClient[];
} | null | undefined;

const isEntryVigente = (entry: CursoAdquiridoClient, now: number): boolean => {
  const status = entry.status ?? 'active';
  if (status !== 'active') return false;
  if (!entry.expiresAt) return true;
  return new Date(entry.expiresAt).getTime() > now;
};

/** Compra/suscripción vigente (sin bypass de Admin). Usar en CTAs de landing. */
export function userHasPurchasedCourseBySlug(
  user: UserWithCursosAdquiridos,
  slug: string
): boolean {
  if (!user || !slug) return false;

  const now = Date.now();
  return (user.cursosAdquiridos || []).some((entry) => {
    const producto = entry?.productoId;
    const entrySlug =
      typeof producto === 'object' && producto ? producto.cursoConfig?.slug : undefined;
    if (!entrySlug || entrySlug !== slug) return false;
    return isEntryVigente(entry, now);
  });
}

export function userHasCourseAccessBySlug(user: UserWithCursosAdquiridos, slug: string): boolean {
  if (!user) return false;
  if (user.rol === 'Admin') return true;
  return userHasPurchasedCourseBySlug(user, slug);
}
