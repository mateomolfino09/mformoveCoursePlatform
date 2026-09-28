/** Cal.com — llamada de consulta del funnel de curso. La atiende Nico. */
export const CURSO_SALES_CALL_BOOKING_URL = 'https://cal.com/yoguinico-move/mmove';

/** Copy del CTA de conversión cuando el curso vende por llamada. */
export function cursoSalesCallCtaLabel(courseName: string): string {
  const name = courseName.trim();
  return name ? `Aplicar a ${name}` : 'Aplicar';
}

/** Duración de la llamada de Nico en Cal.com. */
export const CURSO_SALES_CALL_DURATION_MIN = 20;

/**
 * Persona que atiende la llamada — Nico, no Mateo.
 * Foto en Cloudinary: public id `my_uploads/equipo/nico-llamada2_n14mrv`.
 */
export const CURSO_SALES_CALL_HOST = {
  name: 'Nico',
  roleLine: 'Te va a acompañar en esta conversación.',
  bio:
    'Practico yoga y me gusta explorar el cuerpo de distintas maneras. Me estoy formando como profe de movimiento y terapeuta gestáltico. Cuando puedo, estoy en la playa o caminando por las montañas.',
  /** Public ID Cloudinary (`my_uploads/...`) o URL https. Vacío = avatar de iniciales. */
  imageSrc: 'my_uploads/equipo/nico-llamada2_n14mrv',
} as const;
