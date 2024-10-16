import { Plan } from '../../../../../typings';
import AllPlans from '../../../../components/PageComponent/AdminMembership/AllPlans';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // Determina la URL base según el entorno
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  // Realiza la solicitud fetch a la API de planes
  const res = await fetch(`${baseUrl}/api/payments/plans`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed to fetch plans');
  }

  const plans: Plan[] = await res.json();

  return (
    <AllPlans plans={plans} />
  );
}
