import type { Metadata } from 'next';
import { pageMetadata } from '../../lib/pageMetadata';

export const metadata: Metadata = pageMetadata('Biblioteca de clases');

export default function BibliotecaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
