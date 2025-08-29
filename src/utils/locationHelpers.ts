/**
 * Utilidades para manejar ubicaciones de eventos de manera segura
 */

export interface LocationData {
  display_name?: string;
  lat?: string;
  lon?: string;
  ciudad?: string;
  pais?: string;
}

/**
 * Obtiene el nombre de la ubicación de manera segura
 * @param ubicacion - Puede ser un string o un objeto LocationData
 * @returns string - El nombre de la ubicación formateado
 */
export function getLocationDisplayName(ubicacion: string | LocationData | undefined): string {
  if (!ubicacion) {
    return 'Ubicación por confirmar';
  }

  // Si es un string, devolverlo directamente
  if (typeof ubicacion === 'string') {
    return ubicacion;
  }

  // Si es un objeto, extraer la información relevante
  if (typeof ubicacion === 'object') {
    // Priorizar ciudad si está disponible
    if (ubicacion.ciudad) {
      return ubicacion.ciudad;
    }

    // Si no hay ciudad, usar display_name
    if (ubicacion.display_name) {
      // Extraer solo la primera parte del display_name (antes de la primera coma)
      const parts = ubicacion.display_name.split(',');
      return parts[0].trim();
    }

    // Si no hay display_name, usar país
    if (ubicacion.pais) {
      return ubicacion.pais;
    }
  }

  return 'Ubicación por confirmar';
}

/**
 * Obtiene la ciudad de la ubicación de manera segura
 * @param ubicacion - Puede ser un string o un objeto LocationData
 * @returns string - La ciudad o un valor por defecto
 */
export function getLocationCity(ubicacion: string | LocationData | undefined): string {
  if (!ubicacion) {
    return 'Por confirmar';
  }

  // Si es un string, devolverlo directamente
  if (typeof ubicacion === 'string') {
    return ubicacion;
  }

  // Si es un objeto, extraer la ciudad
  if (typeof ubicacion === 'object') {
    if (ubicacion.ciudad) {
      return ubicacion.ciudad;
    }

    if (ubicacion.display_name) {
      const parts = ubicacion.display_name.split(',');
      return parts[0].trim();
    }
  }

  return 'Por confirmar';
}

/**
 * Obtiene el país de la ubicación de manera segura
 * @param ubicacion - Puede ser un string o un objeto LocationData
 * @returns string - El país o un valor por defecto
 */
export function getLocationCountry(ubicacion: string | LocationData | undefined): string {
  if (!ubicacion) {
    return '';
  }

  // Si es un string, no podemos extraer el país
  if (typeof ubicacion === 'string') {
    return '';
  }

  // Si es un objeto, extraer el país
  if (typeof ubicacion === 'object') {
    if (ubicacion.pais) {
      return ubicacion.pais;
    }

    if (ubicacion.display_name) {
      const parts = ubicacion.display_name.split(',');
      // Buscar el último elemento que suele ser el país
      const lastPart = parts[parts.length - 1]?.trim();
      if (lastPart && lastPart.length > 0) {
        return lastPart;
      }
    }
  }

  return '';
}

/**
 * Verifica si la ubicación es válida
 * @param ubicacion - La ubicación a verificar
 * @returns boolean - true si la ubicación es válida
 */
export function isValidLocation(ubicacion: string | LocationData | undefined): boolean {
  if (!ubicacion) {
    return false;
  }

  if (typeof ubicacion === 'string') {
    return ubicacion.trim().length > 0;
  }

  if (typeof ubicacion === 'object') {
    return !!(ubicacion.ciudad || ubicacion.display_name || ubicacion.pais);
  }

  return false;
}
