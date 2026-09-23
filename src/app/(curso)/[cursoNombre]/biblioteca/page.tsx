import CourseLibrary from '../../../../components/PageComponent/Course/CourseLibrary';

type Props = {
  params: { cursoNombre: string };
};

export default function CursoBibliotecaPage({ params }: Props) {
  return <CourseLibrary slug={params.cursoNombre} />;
}
