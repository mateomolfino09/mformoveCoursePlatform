import type { Metadata } from 'next';
import { getCursoPageTitle } from '../../../../lib/getCursoPageTitle';
import { pageMetadata } from '../../../../lib/pageMetadata';

type Props = {
  params: { cursoNombre: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const curso = await getCursoPageTitle(params.cursoNombre);
  return pageMetadata(`Contenido — ${curso}`);
}

export default function CursoContenidoLayout({ children }: Props) {
  return children;
}
