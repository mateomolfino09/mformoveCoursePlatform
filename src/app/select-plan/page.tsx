'use client'
import { useEffect, useState } from 'react';
import SelectPlan from '../../components/PageComponent/SelectPlan/SelectPlan';
import { revalidateTag } from 'next/cache';
export const revalidate = 0;
export const fetchCache = 'force-no-store'
export default function Page() {
  const [plans, setPlans] = useState([]);
  const origin = process.env.DLOCALGO_CHECKOUT_URL != null ? process.env.DLOCALGO_CHECKOUT_URL : "https://checkout.dlocalgo.com";

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
        console.log("ejecuta el fetch")
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