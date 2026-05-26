import type { Metadata } from 'next';
import { pageMetadata } from '../../lib/pageMetadata';

export const metadata: Metadata = pageMetadata('Preguntas frecuentes');

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
