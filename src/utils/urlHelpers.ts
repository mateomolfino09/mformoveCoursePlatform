/**
 * Convierte un nombre de evento en una URL limpia y válida
 * @param eventName - Nombre del evento
 * @returns URL limpia para el evento
 */
export function createCleanEventUrl(eventName: string): string {
  return eventName
    .toLowerCase()
    .replace(/[áäâà]/g, 'a')
    .replace(/[éëêè]/g, 'e')
    .replace(/[íïîì]/g, 'i')
    .replace(/[óöôò]/g, 'o')
    .replace(/[úüûù]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Remover guiones múltiples
    .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
}

/**
 * Genera la URL de success para un evento
 * @param eventName - Nombre del evento
 * @param baseUrl - URL base del sitio
 * @returns URL completa de success
 */
export function createEventSuccessUrl(eventName: string, baseUrl: string): string {
  const cleanEventName = createCleanEventUrl(eventName);
  return `${baseUrl}/events/${cleanEventName}/success`;
}

/**
 * Ejemplos de transformación:
 * "Es lo mismo" → "es-lo-mismo"
 * "Workshop de Movimiento 2024!" → "workshop-de-movimiento-2024"
 * "Evento Online (Gratis)" → "evento-online-gratis"
 * "Clase de Yoga & Pilates" → "clase-de-yoga-pilates"
 */ 