'use client';
import { useParams } from 'next/navigation';
import EditPromocion from '../../../../../../components/PageComponent/AdminMembership/EditPromocion';

export default function Page() {
  const params = useParams();
  const promocionId = params.id as string;

  return <EditPromocion promocionId={promocionId} />;
}

