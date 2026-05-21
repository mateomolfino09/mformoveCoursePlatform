import { Suspense } from 'react';
import Success from '../../../../components/PageComponent/MembershipActions/Success';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Success />
    </Suspense>
  );
}