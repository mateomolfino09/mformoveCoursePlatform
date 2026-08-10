import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '../../../../../lib/pageMetadata';

type Props = {
  params: { slug: string; classId: string };
  children: ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return pageMetadata(`Clase — ${params.slug}`);
}

export default function ClasesGratisClaseLayout({ children }: Props) {
  return children;
}
