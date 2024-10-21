'use client';
import { useEffect, useState } from 'react';
import Membership from '../../components/PageComponent/Membership/Membership';

export default function Page() {
  const [plans, setPlans] = useState([]);
  const origin = process.env.NODE_ENV !== 'production'
    ? 'https://checkout-sbx.dlocalgo.com'
    : 'https://checkout.dlocalgo.com';

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

  return <Membership plans={plans} origin={origin} />;
}
