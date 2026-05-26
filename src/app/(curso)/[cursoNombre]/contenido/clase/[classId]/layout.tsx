import type { Metadata } from 'next';
import { getCursoPageTitle } from '../../../../../../lib/getCursoPageTitle';
import { pageMetadata } from '../../../../../../lib/pageMetadata';

type Props = {
  params: { cursoNombre: string; classId: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const curso = await getCursoPageTitle(params.cursoNombre);
  return pageMetadata(`Clase — ${curso}`);
}

export default function CursoClaseLayout({ children }: Props) {
  return children;
}
