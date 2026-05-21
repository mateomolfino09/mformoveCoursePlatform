'use client'
import { useEffect, useState } from 'react';
import SelectPlan from '../../components/PageComponent/SelectPlan/SelectPlan';
import { revalidateTag } from 'next/cache';
import MembershipPaused from '../../components/PageComponent/Membership/MembershipPaused';
// Variable para pausar la membresía (debe estar sincronizada con la de la página)
const IS_MEMBERSHIP_PAUSED = true;
export const revalidate = 0;
export const fetchCache = 'force-no-store'
export default function Page() {
  const [plans, setPlans] = useState([]);
  const origin = process.env.DLOCALGO_CHECKOUT_URL != null ? process.env.DLOCALGO_CHECKOUT_URL : "https://checkout.dlocalgo.com";

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
  return (
    <SelectPlan plans={plans} origin={origin}/>
  );
}