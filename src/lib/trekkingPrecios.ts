const ZONA = 'America/Montevideo';
const ULTIMO_DIA_ANTICIPADO = '2026-11-14';

export type TarifasTrekking = {
  anticipado: boolean;
  etiqueta: string | null;
  general: number;
  generalTexto: string;
};

export function esTrekkingCanadon(nombre?: string | null): boolean {
  const normalizado = (nombre || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return (
    normalizado.includes('movement trekking') ||
    normalizado.includes('canadon de la palma')
  );
}

/** Fecha calendario YYYY-MM-DD en America/Montevideo. */
export function fechaMontevideo(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(ahora);
}

export function pesosUy(valor: number): string {
  return `$${valor.toLocaleString('es-UY')}`;
}

/**
 * Tarifas vigentes del trekking. Antes del 15/11 00:00 (Uruguay) devuelve
 * solo el anticipado. Desde ese instante, solo el regular. Otros eventos: null.
 */
export function preciosTrekkingVigentes(
  evento: { nombre?: string | null } | null | undefined,
  ahora: Date = new Date()
): TarifasTrekking | null {
  if (!esTrekkingCanadon(evento?.nombre)) return null;

  const anticipado = fechaMontevideo(ahora) <= ULTIMO_DIA_ANTICIPADO;
  const general = anticipado ? 1300 : 1600;

  return {
    anticipado,
    etiqueta: anticipado ? 'Precio anticipado hasta el 14/11' : null,
    general,
    generalTexto: pesosUy(general),
  };
}
