'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Redirige a la página unificada de módulos (evita duplicar lógica). */
export default function SubmodulesRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/memberships/class-modules');
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F7CCF]" />
    </div>
  );
}
