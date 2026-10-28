import type { Metadata } from 'next';
import { getCursoPageTitle } from '../../../lib/getCursoPageTitle';
import { pageMetadata } from '../../../lib/pageMetadata';

type Props = {
  params: { cursoNombre: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const title = await getCursoPageTitle(params.cursoNombre);
  if (params.cursoNombre === 'cuerpo-autonomo') {
    return pageMetadata(
      title,
      'Escuela online de movimiento creada por Mateo Molfino. Clases a tu ritmo, encuentros grupales semanales y una comunidad para construir fuerza, movilidad y coordinación. USD 149 por 4 meses.'
    );
  }
  return pageMetadata(title);
}

export default function CursoSlugLayout({ children }: Props) {
  return children;
}
