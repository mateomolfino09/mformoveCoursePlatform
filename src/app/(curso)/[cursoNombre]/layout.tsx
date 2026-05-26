import type { Metadata } from 'next';
import { getCursoPageTitle } from '../../../lib/getCursoPageTitle';
import { pageMetadata } from '../../../lib/pageMetadata';

type Props = {
  params: { cursoNombre: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const title = await getCursoPageTitle(params.cursoNombre);
  return pageMetadata(title);
}

export default function CursoSlugLayout({ children }: Props) {
  return children;
}
