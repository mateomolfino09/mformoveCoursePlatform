export const CURSO_SUSCRIPCION_INTERVALO_MENSUAL = 1;
/** Único ciclo a la venta: se cobra de una cada 3 meses. */
export const CURSO_SUSCRIPCION_INTERVALO_3_MESES = 3;
/** Plan viejo (paga 3, se lleva 4). Ya no se ofrece. */
export const CURSO_SUSCRIPCION_INTERVALO_4_MESES = 4;
/** Meses cobrados en el plan de 4 meses (paga 3, se lleva 4). */
export const CURSO_SUSCRIPCION_MESES_COBRADOS_EN_4 = 3;

export function precioCursoSuscripcion4Meses(precioMensual: number): number {
  return Number(precioMensual) * CURSO_SUSCRIPCION_MESES_COBRADOS_EN_4;
}

export function resolveCursoPlanIntervaloMeses(
  plan: { intervaloMeses?: number } | null | undefined
): number {
  const n = Number(plan?.intervaloMeses);
  if (n === CURSO_SUSCRIPCION_INTERVALO_3_MESES) return CURSO_SUSCRIPCION_INTERVALO_3_MESES;
  if (n === CURSO_SUSCRIPCION_INTERVALO_4_MESES) return CURSO_SUSCRIPCION_INTERVALO_4_MESES;
  return CURSO_SUSCRIPCION_INTERVALO_MENSUAL;
}

/** El plan de un mes no se vende. Si hay un ciclo más largo, el mensual queda afuera. */
export function planesSuscripcionVendibles<T extends { intervaloMeses?: number }>(planes: T[]): T[] {
  const largos = planes.filter(
    (plan) => resolveCursoPlanIntervaloMeses(plan) > CURSO_SUSCRIPCION_INTERVALO_MENSUAL
  );
  return largos.length > 0 ? largos : planes;
}

export function accesoSuscripcionHasta(from = new Date()): Date {
  const expires = new Date(from);
  expires.setMonth(expires.getMonth() + CURSO_SUSCRIPCION_INTERVALO_3_MESES);
  return expires;
}

export function isCursoCheckoutSuscripcion(
  esSuscripcion: boolean | undefined,
  planes: Array<{ proveedor?: string; intervaloMeses?: number }>
): boolean {
  if (esSuscripcion) return true;
  const stripePlanes = planes.filter((p) => p.proveedor === 'stripe');
  return (
    stripePlanes.length > 1 ||
    stripePlanes.some((p) => resolveCursoPlanIntervaloMeses(p) > 1)
  );
}
