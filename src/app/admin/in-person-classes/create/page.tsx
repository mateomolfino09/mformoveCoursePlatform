'use client';
import { useEffect, useState } from 'react';
import CreateInPersonClass from '../../../../components/PageComponent/AdminInPersonClass/CreateInPersonClass';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return <CreateInPersonClass />;
}


