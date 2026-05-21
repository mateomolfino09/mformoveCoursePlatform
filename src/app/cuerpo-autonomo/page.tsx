import { redirect } from 'next/navigation';
import { getLatestPublishedCursoPayload } from '../../lib/latestPublishedCurso';
import { routes } from '../../constants/routes';

/** La landing dejó de existir; esta URL redirige al último curso publicado (compatibilidad de enlaces). */
export default async function CuerpoAutonomoRedirectPage() {
  const curso = await getLatestPublishedCursoPayload();
  if (curso) {
    redirect(routes.navegation.membership.curso(curso.slug));
  }
  redirect(routes.navegation.index);
}
