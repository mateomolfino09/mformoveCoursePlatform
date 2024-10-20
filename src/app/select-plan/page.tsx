'use client'
import { useEffect, useState } from 'react';
import SelectPlan from '../../components/PageComponent/SelectPlan/SelectPlan';

export default function Page() {
  const [plans, setPlans] = useState([]);
  const origin = process.env.DLOCALGO_CHECKOUT_URL != null ? process.env.DLOCALGO_CHECKOUT_URL : "https://checkout-sbx.dlocalgo.com";

  useEffect(() => {
    
    async function fetchPlans() {
      try {
        const res = await fetch('/api/payments/getPlans', {
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
  

  return (
    <SelectPlan plans={plans} origin={origin}/>
  );
}
