/** Cal.com — llamada de consulta del funnel de curso (20 min). */
export const CURSO_SALES_CALL_BOOKING_URL = 'https://cal.com/yoguinico-move/mmove';

/** Avatar de respaldo (perfil Cal.com) si no hay foto en Cloudinary. */
export const CURSO_SALES_CALL_HOST_AVATAR_FALLBACK =
  'https://lh3.googleusercontent.com/a/ACg8ocIExYH4j67lM3LG7xigdhVuklEARiZrarM399LR1GxOCZosvA=s400-c';

/**
 * Persona que acompaña la llamada (no es Mateo).
 *
 * Foto: en Cloudinary Media Library, copiá el **Public ID** (panel Summary)
 * o la **URL de entrega** y pegala en `imageSrc`.
 * Ejemplo: `my_uploads/abc123xyz` (como el fondo de `/registro`).
 */
export const CURSO_SALES_CALL_HOST = {
  name: 'Nico',
  roleLine: 'Te va a acompañar en esta conversación.',
  bio:
    'Practico yoga y me gusta explorar el cuerpo de distintas maneras. Me estoy formando como profe de movimiento y terapeuta gestáltico. Cuando puedo, estoy en la playa o caminando por las montañas.',
  /** Public ID Cloudinary (`my_uploads/...`) o URL https. Vacío = avatar Cal.com. */
  imageSrc: 'my_uploads/equipo/nico-llamada2_n14mrv',
} as const;
