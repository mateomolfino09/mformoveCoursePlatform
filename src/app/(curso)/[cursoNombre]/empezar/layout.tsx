import type { Metadata } from 'next';
import { getCursoPageTitle } from '../../../../lib/getCursoPageTitle';
import { pageMetadata } from '../../../../lib/pageMetadata';

type Props = {
  params: { cursoNombre: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const curso = await getCursoPageTitle(params.cursoNombre);
  return pageMetadata(`Comprar — ${curso}`);
}

export default function CursoEmpezarLayout({ children }: Props) {
  return children;
}
