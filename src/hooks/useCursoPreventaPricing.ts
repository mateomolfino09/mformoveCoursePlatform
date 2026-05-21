'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CursoLandingConfig, CursoPrecioPreventa } from '../types/cursoLanding';
import { isCursoEnPreventa, parseCursoPublicationDate } from '../lib/cursoLandingPublication';
import { resolveActivePrecioPreventa } from '../lib/cursoPricing';

export function formatCursoFechaLargo(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatCursoFechaConHora(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export type CursoPreventaPricingState = {
  enPreventa: boolean;
  precioPreventaActivo: CursoPrecioPreventa | null;
  fechaLanzamiento: Date | null;
  preventaFechaFin: Date | null;
};

export function getCursoPreventaPricing(
  cursoConfig: CursoLandingConfig,
  now = new Date()
): CursoPreventaPricingState {
  const enPreventa = isCursoEnPreventa(cursoConfig, now);
  const precioPreventaActivo = enPreventa
    ? resolveActivePrecioPreventa(cursoConfig.preciosPreventa, now)
    : null;

  return {
    enPreventa: Boolean(enPreventa && precioPreventaActivo),
    precioPreventaActivo,
    fechaLanzamiento: parseCursoPublicationDate(cursoConfig.fechaPublicacion),
    preventaFechaFin: parseCursoPublicationDate(precioPreventaActivo?.fechaFin ?? null),
  };
}

/** Tiempo restante en ms hasta `target`; 0 si ya venció o no hay fecha. */
export function useCountdownTo(target: Date | null, intervalMs = 1000): number {
  const targetTs = target?.getTime() ?? null;

  const [remainingMs, setRemainingMs] = useState(() =>
    targetTs != null ? Math.max(0, targetTs - Date.now()) : 0
  );

  useEffect(() => {
    if (targetTs == null) {
      setRemainingMs(0);
      return;
    }

    const tick = () => setRemainingMs(Math.max(0, targetTs - Date.now()));
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [targetTs, intervalMs]);

  return remainingMs;
}

export function useCursoPreventaPricing(cursoConfig: CursoLandingConfig) {
  return useMemo(() => getCursoPreventaPricing(cursoConfig), [cursoConfig]);
}

export function splitCountdownUnits(remainingMs: number) {
  const totalSec = Math.floor(remainingMs / 1000);
  const countDays = Math.floor(totalSec / 86400);
  const countHours = Math.floor((totalSec % 86400) / 3600);
  const countMinutes = Math.floor((totalSec % 3600) / 60);
  const countSeconds = totalSec % 60;
  const pad2 = (n: number) => String(n).padStart(2, '0');

  return [
    { value: pad2(countDays), label: 'días' },
    { value: pad2(countHours), label: 'hs' },
    { value: pad2(countMinutes), label: 'min' },
    { value: pad2(countSeconds), label: 'seg' },
  ] as const;
}
