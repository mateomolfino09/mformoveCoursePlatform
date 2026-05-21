import { redirect } from 'next/navigation';
import { getLatestPublishedCursoPayload } from '../../lib/latestPublishedCurso';
import { routes } from '../../constants/routes';

/** Compatibilidad: /membership redirige al curso publicado (antes landing MoveCrew). */
export default async function MembershipPage() {
  const curso = await getLatestPublishedCursoPayload();
  if (curso) {
    redirect(routes.navegation.membership.curso(curso.slug));
  }
  redirect(routes.navegation.index);
}
