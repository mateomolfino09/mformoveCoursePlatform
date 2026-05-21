'use client';
import { useEffect, useState } from 'react';
import AllPlans from '../../../../components/PageComponent/AdminMembership/AllPlans';

export default function Page() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/payments/getPlans', {
          // Configuración para evitar el caché en todas partes:
          cache: 'no-store', // Deshabilita el caché del navegador
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0', // Deshabilita el caché del servidor
          },
          next: {
            tags: ['plans'],
          },
        });
        const data = await res.json();
        setPlans(data);
      } catch (err) {
        console.error('Error fetching plans:', err);
      }
    }

    fetchPlans();
  }, []);

  return <AllPlans plans={plans} />;
}
