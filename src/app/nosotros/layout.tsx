import type { Metadata } from 'next';
import { pageMetadata } from '../../lib/pageMetadata';

export const metadata: Metadata = pageMetadata('Nosotros');

export default function NosotrosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
