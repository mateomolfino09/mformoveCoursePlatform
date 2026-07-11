'use client';

import { useEffect, useState } from 'react';
import { fetchOwnedCursoRedirectPath } from '../lib/resolveOwnedCursoRedirect';
import { CursoLandingConfig, CursoPlanPago } from '../types/cursoLanding';

export type CursoCheckoutPayload = {
  product: {
    _id?: string;
    nombre: string;
    portada?: string;
  };
  cursoConfig: CursoLandingConfig;
  opcionesPago: CursoPlanPago[];
  pricingModo?: 'preventa' | 'lanzamiento';
  preventaTierIndex?: number | null;
};

type BootstrapState =
  | { status: 'loading' }
  | { status: 'checkout'; payload: CursoCheckoutPayload }
  | { status: 'error'; message: string };

async function fetchCursoCheckout(slug: string): Promise<CursoCheckoutPayload> {
  const response = await fetch(`/api/product/curso/${slug}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
    },
  });

  const text = await response.text();
  if (!response.ok) {
    let message = 'Error al obtener el curso';
    if (text) {
      try {
        const payload = JSON.parse(text);
        message = payload?.error || message;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }

  const data = JSON.parse(text) as CursoCheckoutPayload;
  return {
    product: data.product,
    cursoConfig: data.cursoConfig,
    opcionesPago: Array.isArray(data.opcionesPago) ? data.opcionesPago : [],
    pricingModo: data.pricingModo,
    preventaTierIndex: data.preventaTierIndex ?? null,
  };
}

function hasUserToken(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((row) => row.startsWith('userToken='));
}

/**
 * Carga checkout + verificación de acceso en paralelo (un solo estado de loading).
 */
export function useCursoEmpezarBootstrap(slug: string) {
  const [state, setState] = useState<BootstrapState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    const bootstrap = async () => {
      try {
        const ownedPromise = hasUserToken()
          ? fetchOwnedCursoRedirectPath({ slug })
          : Promise.resolve(null);

        const [payload, ownedPath] = await Promise.all([
          fetchCursoCheckout(slug),
          ownedPromise,
        ]);

        if (cancelled) return;

        if (ownedPath) {
          window.location.replace(ownedPath);
          return;
        }

        setState({ status: 'checkout', payload });
      } catch (err) {
        if (cancelled) return;
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Error desconocido',
        });
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}
