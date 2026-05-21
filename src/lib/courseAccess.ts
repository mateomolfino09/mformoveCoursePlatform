import type { CursoLandingConfig } from '../types/cursoLanding';
import {
  isCursoEnPreventa,
  parseCursoPublicationDate,
} from './cursoLandingPublication';

type UserWithCourses = {
  rol?: string;
  cursosAdquiridos?: Array<{ productoId?: { toString(): string } | string }>;
};

export function userHasCourseAccess(user: UserWithCourses | null, productId: string): boolean {
  if (!user) return false;
  if (user.rol === 'Admin') return true;
  const target = productId.toString();
  return (user.cursosAdquiridos || []).some(
    (entry) => entry?.productoId?.toString() === target
  );
}

/** El contenido grabado está disponible (post-lanzamiento o publicado). */
export function isCursoContenidoDisponible(
  config?: Pick<CursoLandingConfig, 'publicado' | 'fechaPublicacion'> | null,
  now = new Date()
): boolean {
  if (!config) return false;
  if (config.publicado) return true;
  const launch = parseCursoPublicationDate(config.fechaPublicacion);
  if (!launch) return true;
  return launch.getTime() <= now.getTime();
}

export function canUserAccessCursoContenido(
  user: UserWithCourses | null,
  productId: string,
  cursoConfig?: Pick<CursoLandingConfig, 'publicado' | 'fechaPublicacion'> | null,
  now = new Date()
): { ok: boolean; reason?: 'no_auth' | 'no_purchase' | 'not_launched' } {
  if (!user) return { ok: false, reason: 'no_auth' };
  if (user.rol === 'Admin') return { ok: true };
  if (!userHasCourseAccess(user, productId)) {
    return { ok: false, reason: 'no_purchase' };
  }
  if (!isCursoContenidoDisponible(cursoConfig, now)) {
    return { ok: false, reason: 'not_launched' };
  }
  return { ok: true };
}

export function cursoContenidoBlockedMessage(
  reason?: 'no_auth' | 'no_purchase' | 'not_launched',
  fechaLanzamiento?: Date | null
): string {
  if (reason === 'no_auth') return 'Iniciá sesión para acceder al contenido del curso.';
  if (reason === 'no_purchase') return 'Este curso no está en tu cuenta. Compralo para acceder al contenido.';
  if (reason === 'not_launched') {
    if (fechaLanzamiento) {
      return `El contenido se habilita el ${fechaLanzamiento.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}.`;
    }
    return 'El contenido del curso aún no está disponible.';
  }
  return 'No tenés acceso a este contenido.';
}
