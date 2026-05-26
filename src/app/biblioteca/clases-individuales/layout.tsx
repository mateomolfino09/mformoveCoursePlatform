import type { Metadata } from 'next';
import { pageMetadata } from '../../../lib/pageMetadata';

export const metadata: Metadata = pageMetadata('Clases individuales');

export default function ClasesIndividualesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
