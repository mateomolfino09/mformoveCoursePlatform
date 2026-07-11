'use client';

import { useEffect, useState } from 'react';
import {
  MentorshipBillingInterval,
  MentorshipPlanPagoOption,
  MentorshipPlan,
} from '../../../types/mentorship';

export type MentorshipCheckoutPayload = {
  plan: MentorshipPlan;
  interval: MentorshipBillingInterval;
  availableIntervals: MentorshipBillingInterval[];
  price: {
    interval: MentorshipBillingInterval;
    price: number;
    currency: string;
    stripePriceId: string;
  };
  opcionesPago: MentorshipPlanPagoOption[];
};

type BootstrapState =
  | { status: 'loading' }
  | { status: 'checkout'; payload: MentorshipCheckoutPayload }
  | { status: 'error'; message: string };

export function useMentorshipEmpezarBootstrap(interval: string | null) {
  const [state, setState] = useState<BootstrapState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    const params = new URLSearchParams();
    if (interval) params.set('interval', interval);

    fetch(`/api/mentorship/checkout?${params.toString()}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'No se pudo cargar el checkout');
        }
        if (!cancelled) {
          setState({ status: 'checkout', payload: data as MentorshipCheckoutPayload });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Error al cargar el checkout',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [interval]);

  return state;
}
