import Membership from '../../components/PageComponent/Membership/Membership';
import { ClassTypes, Plan } from '../../../typings';

export const dynamic = "force-dynamic"; 
export const fetchCache = "force-no-store";

export default async function Page() {
  let plans: Plan[];
  
  const baseUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_BASE_URL;

  const res = await fetch(`${baseUrl}/api/payments/plans`, { next: { revalidate: 0 } });
  
  if (!res.ok) {
    throw new Error('Failed to fetch plans');
  }

  plans = await res.json();

  const origin = process.env.NODE_ENV !== 'production' 
    ? "https://checkout-sbx.dlocalgo.com" 
    : "https://checkout.dlocalgo.com";

  return (
    <Membership plans={plans} origin={origin}/>
  );
}
