import type { Metadata } from 'next';
import { pageMetadata } from '../../lib/pageMetadata';

export const metadata: Metadata = pageMetadata('Ruta semanal');

export default function RutaSemanalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
