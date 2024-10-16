import { ClassTypes, Plan } from '../../../typings';
import Membership from '../../components/PageComponent/Membership/Membership';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // Define la URL base según el entorno
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  // Realiza la solicitud fetch a la API de planes
  const res = await fetch(`${baseUrl}/api/payments/plans`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed to fetch plans');
  }

  const plans: Plan[] = await res.json();

  // Define el origen según el entorno
  const origin = process.env.NODE_ENV !== 'production'
    ? "https://checkout-sbx.dlocalgo.com"
    : "https://checkout.dlocalgo.com";

  return (
    <Membership plans={plans} origin={origin} />
  );
}
