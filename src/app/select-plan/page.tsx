import SelectPlan from '../../components/PageComponent/SelectPlan/SelectPlan';

export default async function Page() {
  let plans = [];

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/plans`, { next: { revalidate: 0 } });


  if (!res.ok) {
    throw new Error('Failed to fetch plans');
  }

  plans = await res.json();

  const origin = process.env.DLOCALGO_CHECKOUT_URL || "https://checkout-sbx.dlocalgo.com";
  console.log(origin);

  return (
    <SelectPlan plans={plans} origin={origin}/>
  );
}
