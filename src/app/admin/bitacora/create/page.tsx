'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirige al formulario completo de creación de camino semanal,
 * donde se pueden crear clases de módulo y clases individuales desde el mismo flujo.
 */
export default function CreateBitacoraRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/memberships/bitacora/create');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900" />
    </div>
  );
}
