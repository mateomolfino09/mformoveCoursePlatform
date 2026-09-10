/** Calendly — llamada de venta/cierre del funnel de curso. */
export const CURSO_SALES_CALL_BOOKING_URL = 'https://calendly.com/murialmatheo/30min';

/** Copy del CTA de conversión cuando el curso vende por llamada. */
export function cursoSalesCallCtaLabel(courseName: string): string {
  const name = courseName.trim();
  return name ? `Aplicar a ${name}` : 'Aplicar';
}

/** Duración real de la llamada (ver `CURSO_SALES_CALL_BOOKING_URL` — Calendly, 30 min). */
export const CURSO_SALES_CALL_DURATION_MIN = 30;

/**
 * Persona que atiende la llamada — hoy Theo (closer), no Mateo.
 *
 * No hay foto real de Theo cargada todavía: `imageSrc` queda vacío a propósito y el avatar
 * se renderiza como iniciales (ver `CourseScheduleCall.tsx`) en vez de usar una foto de
 * otra persona con un nombre distinto.
 *
 * Foto (cuando haya una real): en Cloudinary Media Library, copiá el **Public ID** (panel
 * Summary) o la **URL de entrega** y pegala acá. Ejemplo: `my_uploads/abc123xyz`.
 */
export const CURSO_SALES_CALL_HOST = {
  name: 'Theo',
  roleLine: 'Te ayuda a decidir si Cuerpo Autónomo es para vos.',
  bio:
    'Habla con las personas que están evaluando sumarse a Cuerpo Autónomo, para responder dudas concretas y ver si el programa encaja con lo que estás buscando.',
  /** Public ID Cloudinary (`my_uploads/...`) o URL https. Vacío = avatar de iniciales. */
  imageSrc: '',
} as const;
