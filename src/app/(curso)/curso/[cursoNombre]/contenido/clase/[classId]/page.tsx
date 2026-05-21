'use client';

import { Suspense } from 'react';
import CourseClassPractice from '../../../../../../../components/PageComponent/Course/CourseClassPractice';

function PracticeContent({
  params,
}: {
  params: { cursoNombre: string; classId: string };
}) {
  return <CourseClassPractice slug={params.cursoNombre} classId={params.classId} />;
}

export default function CursoClasePracticePage({
  params,
}: {
  params: { cursoNombre: string; classId: string };
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
