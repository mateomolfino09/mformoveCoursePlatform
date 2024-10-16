import SelectPlan from '../../components/PageComponent/SelectPlan/SelectPlan';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // Usa `VERCEL_URL` si está definido, o `localhost` para desarrollo
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  // const res = await fetch(`${baseUrl}/api/payments/plans`, { cache: 'no-store' });
  const res = await fetch(`https://mformove-platform-dr9mwqv77-mateomolfino09s-projects.vercel.app/api/payments/plans`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed toaaa fetch plans');
  }

  const plans = await res.json();

  const origin = process.env.DLOCALGO_CHECKOUT_URL != null
    ? process.env.DLOCALGO_CHECKOUT_URL
    : "https://checkout-sbx.dlocalgo.com";

  return (
    <SelectPlan plans={plans} origin={origin} />
  );
}
