import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '../../../lib/pageMetadata';

type Props = {
  params: { slug: string };
  children: ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return pageMetadata(`Clases gratis — ${params.slug}`);
}

export default function ClasesGratisLayout({ children }: Props) {
  return children;
}
