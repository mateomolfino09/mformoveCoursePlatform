type CursoLandingEvent =
  | 'curso_inscripcion_click'
  | 'curso_checkout_start'
  | 'curso_llamada_click';

/** Eventos de la landing. No marca un clic como compra. */
export function trackCursoLandingEvent(
  event: CursoLandingEvent,
  params?: { slug?: string }
) {
  if (typeof window === 'undefined') return;
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== 'function') return;

  gtag('event', event, {
    event_category: 'curso',
    event_label: params?.slug || 'cuerpo-autonomo',
  });
}
