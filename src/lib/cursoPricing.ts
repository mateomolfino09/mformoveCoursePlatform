import type { CursoLandingConfig, CursoPlanPago, CursoPrecioPreventa } from '../types/cursoLanding';
import { isCursoEnPreventa, parseCursoPublicationDate } from './cursoLandingPublication';

export type CursoCheckoutPricingMode = 'preventa' | 'lanzamiento';

export type CursoCheckoutPricingResult = {
  plans: CursoPlanPago[];
  modo: CursoCheckoutPricingMode;
  precioPreventaActivo: CursoPrecioPreventa | null;
  /** Índice en cursoConfig.preciosPreventa cuando modo === 'preventa' */
  preventaTierIndex: number | null;
};

function findPreventaTierIndex(
  precios: CursoPrecioPreventa[] | undefined,
  active: CursoPrecioPreventa | null
): number | null {
  if (!active || !precios?.length) return null;
  const idx = precios.findIndex(
    (p) =>
      p.etiqueta === active.etiqueta &&
      p.monto === active.monto &&
      String(p.fechaFin) === String(active.fechaFin)
  );
  return idx >= 0 ? idx : null;
}

function parsePreventaEnd(value: string | Date | null | undefined): Date | null {
  return parseCursoPublicationDate(value);
}

/** Precio de preventa vigente: activo, con cupo, fecha fin en el futuro; el de fecha fin más próxima gana. */
export function resolveActivePrecioPreventa(
  precios: CursoPrecioPreventa[] | undefined,
  now = new Date()
): CursoPrecioPreventa | null {
  if (!precios?.length) return null;

  const nowTs = now.getTime();
  const eligible = precios
    .filter((p) => p.activo !== false)
    .filter((p) => {
      const fin = parsePreventaEnd(p.fechaFin);
      return fin != null && fin.getTime() > nowTs;
    })
    .filter((p) => {
      const limite = Number(p.cuposLimite) || 0;
      const usados = Number(p.cuposUsados) || 0;
      return limite > 0 && usados < limite;
    })
    .sort((a, b) => {
      const fa = parsePreventaEnd(a.fechaFin)!.getTime();
      const fb = parsePreventaEnd(b.fechaFin)!.getTime();
      if (fa !== fb) return fa - fb;
      return (a.orden ?? 0) - (b.orden ?? 0);
    });

  return eligible[0] ?? null;
}

export function resolveCursoCheckoutPlans(
  cursoConfig: CursoLandingConfig,
  now = new Date()
): CursoCheckoutPricingResult {
  const lanzamientoPlans = (cursoConfig.planes?.opcionesPago || []).filter(
    (p) => p.activo && p.paymentLink
  );

  if (!isCursoEnPreventa(cursoConfig, now)) {
    return {
      plans: lanzamientoPlans,
      modo: 'lanzamiento',
      precioPreventaActivo: null,
      preventaTierIndex: null,
    };
  }

  const preventa = resolveActivePrecioPreventa(cursoConfig.preciosPreventa, now);
  if (!preventa) {
    return {
      plans: lanzamientoPlans,
      modo: 'lanzamiento',
      precioPreventaActivo: null,
      preventaTierIndex: null,
    };
  }

  const preventaPlans = (preventa.opcionesPago || []).filter((p) => p.activo && p.paymentLink);
  const preventaTierIndex = findPreventaTierIndex(cursoConfig.preciosPreventa, preventa);

  const plans =
    preventaPlans.length > 0
      ? preventaPlans
      : lanzamientoPlans.map((plan) => ({
          ...plan,
          monto: preventa.monto,
          moneda: preventa.moneda || plan.moneda,
          etiqueta: preventa.etiqueta
            ? `${preventa.etiqueta} — ${plan.proveedor === 'dlocalgo' ? 'cuotas' : 'tarjeta'}`
            : plan.etiqueta,
          descripcion: preventa.descripcion || plan.descripcion,
        }));

  return {
    plans,
    modo: 'preventa',
    precioPreventaActivo: preventa,
    preventaTierIndex,
  };
}

/** Monto del plan de lanzamiento activo (referencia tachada en preventa). */
export function resolveCursoLanzamientoMonto(cursoConfig: CursoLandingConfig): number | null {
  const plan = (cursoConfig.planes?.opcionesPago || []).find((p) => p.activo && p.monto > 0);
  return plan ? Number(plan.monto) : null;
}
