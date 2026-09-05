export const CURSO_SUSCRIPCION_INTERVALO_MENSUAL = 1;
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
  return n === CURSO_SUSCRIPCION_INTERVALO_4_MESES
    ? CURSO_SUSCRIPCION_INTERVALO_4_MESES
    : CURSO_SUSCRIPCION_INTERVALO_MENSUAL;
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
