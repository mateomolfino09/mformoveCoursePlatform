/** Listados compartidos de “Qué incluye” (landing + checkout). */

export const MENTORSHIP_TRIMESTRAL_INCLUDES = [
  'Evaluación inicial completa',
  '1 plan de entrenamiento personalizado',
  '3 meses de seguimiento por WhatsApp',
  'Feedback sobre tus videos durante todo el proceso',
  'Ajustes del plan cuando sean necesarios',
  '3 llamadas individuales (1 por mes)',
  '1 llamada grupal con la comunidad cada mes',
  'Acceso a la comunidad privada',
] as const;

/** Equivalente trimestral escalado a 12 meses (sin bonos de regalo). */
export const MENTORSHIP_ANUAL_INCLUDES = [
  'Evaluación inicial completa',
  '1 plan de entrenamiento personalizado',
  '12 meses de seguimiento por WhatsApp',
  'Feedback sobre tus videos durante todo el proceso',
  'Ajustes del plan cuando sean necesarios',
  '18 llamadas individuales (cada 3 semanas)',
  '1 llamada grupal con la comunidad cada mes',
  'Acceso a la comunidad privada',
] as const;

/** Bonos extra solo del plan anual. */
export const MENTORSHIP_ANUAL_BONUS_STATIC = [
  '+10 clases de movimiento y nuevas todos los meses',
  'Pase libre a todas las clases presenciales',
  'Beneficios exclusivos en futuros talleres y eventos',
] as const;

export function buildMentorshipCoursesAccessLabel(courseNames: string[]): string {
  const names = courseNames.map((n) => n.trim()).filter(Boolean);
  if (names.length === 0) return 'Acceso completo a todos mis cursos';
  return `Acceso completo a: ${names.join(', ')}`;
}

export function buildMentorshipAnualBonusItems(courseNames: string[]): string[] {
  return [buildMentorshipCoursesAccessLabel(courseNames), ...MENTORSHIP_ANUAL_BONUS_STATIC];
}
