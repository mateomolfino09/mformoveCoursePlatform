'use client';

import { useEffect, useState } from 'react';
import Mentorship from '../../components/PageComponent/Mentorship/Mentorship';
import { MentorshipPlan } from '../../types/mentorship';

export default function MentorshipPage() {
  const [plans, setPlans] = useState<MentorshipPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMentorshipPlans() {
      try {
        setPlansLoading(true);
        setPlansError(null);

        const res = await fetch('/api/payments/getPlans?type=mentorship', {
          // Cache corta en cliente: no bloquear el hero por un refetch agresivo
          cache: 'default',
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Error al cargar los planes de mentoría (${res.status}): ${errorText}`);
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error('Formato de datos inválido');
        }

        setPlans(data.filter((plan: MentorshipPlan) => plan.active));
      } catch (err) {
        console.error('Error fetching mentorship plans:', err);
        setPlansError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setPlansLoading(false);
      }
    }

    fetchMentorshipPlans();
  }, []);

  return (
    <Mentorship
      plans={plans}
      plansLoading={plansLoading}
      plansError={plansError}
      origin={typeof window !== 'undefined' ? window.location.origin : ''}
    />
  );
}
