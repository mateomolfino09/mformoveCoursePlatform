'use client';
import { useEffect, useState } from 'react';
import AllPlans from '../../../../components/PageComponent/AdminMembership/AllPlans';

export default function Page() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/payments/getPlans', {
          headers: {
            'Cache-Control': 'no-store, max-age=0',  // Cache-Control a nivel de fetch
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
