'use client';

import { Suspense } from 'react';
import FreeSequentialClassPractice from '../../../../../components/PageComponent/FreeSequential/FreeSequentialClassPractice';

function PracticeContent({
  params,
}: {
  params: { slug: string; classId: string };
}) {
  return <FreeSequentialClassPractice slug={params.slug} classId={params.classId} />;
}

export default function ClasesGratisClasePage({
  params,
}: {
  params: { slug: string; classId: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-palette-ink flex items-center justify-center text-palette-cream">
          Cargando clase...
        </div>
      }
    >
      <PracticeContent params={params} />
    </Suspense>
  );
}
