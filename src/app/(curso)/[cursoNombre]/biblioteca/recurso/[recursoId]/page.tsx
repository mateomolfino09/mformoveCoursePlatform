import { CourseResourceView } from '../../../../../../components/PageComponent/Course/CourseLibrary';

type Props = {
  params: { cursoNombre: string; recursoId: string };
};

export default function CursoRecursoPage({ params }: Props) {
  return <CourseResourceView slug={params.cursoNombre} recursoId={decodeURIComponent(params.recursoId)} />;
}
