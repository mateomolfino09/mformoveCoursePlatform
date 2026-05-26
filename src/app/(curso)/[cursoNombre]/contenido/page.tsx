'use client';

import CourseContentHub from '../../../../components/PageComponent/Course/CourseContentHub';

export default function CursoContenidoPage({
  params,
}: {
  params: { cursoNombre: string };
}) {
  return <CourseContentHub slug={params.cursoNombre} />;
}
