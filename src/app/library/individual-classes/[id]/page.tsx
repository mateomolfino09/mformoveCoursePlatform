import { IndividualClass, Question } from '../../../../../typings';
import connectDB from '../../../../config/connectDB';
import { getClassById } from '../../../api/individualClass/getClassById';
import { getQuestionsFromClass } from '../../../api/individualClass/getAllQuestions';
import LibraryClassView from '../../../../components/PageComponent/ClassPage/LibraryClassView';
import { notFound } from 'next/navigation';

connectDB();

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clase: IndividualClass | null | undefined = await getClassById(id);
  if (!clase) return { title: 'Clase no encontrada' };
  return {
    title: `${clase.name} - Clases individuales`,
    description: (clase.description ?? '').slice(0, 160) || 'Clase de la biblioteca',
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const clase: IndividualClass | null | undefined = await getClassById(id);
  if (!clase) notFound();

  const questions: Question[] | undefined = await getQuestionsFromClass(clase._id);

  return <LibraryClassView clase={clase} questions={questions} />;
}
