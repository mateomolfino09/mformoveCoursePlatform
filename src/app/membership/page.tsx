'use client';
import { useEffect, useState } from 'react';
import Membership from '../../components/PageComponent/Membership/Membership';
import MembershipPaused from '../../components/PageComponent/Membership/MembershipPaused';

// Variable para pausar la membresía
const IS_MEMBERSHIP_PAUSED = true;

export default function Page() {
  const [plans, setPlans] = useState([]);
  const origin = process.env.NODE_ENV !== 'production'
    ? 'https://checkout-sbx.dlocalgo.com'
    : 'https://checkout.dlocalgo.com';

  useEffect(() => {
    if (IS_MEMBERSHIP_PAUSED) return;
    async function fetchPlans() {
      try {
        const res = await fetch('/api/payments/getPlans', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
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

  if (IS_MEMBERSHIP_PAUSED) {
    return <MembershipPaused />;
  }
  return <Membership plans={plans} origin={origin} />;
}
