import type { Metadata } from 'next';
import { pageMetadata } from '../../lib/pageMetadata';

export const metadata: Metadata = pageMetadata('Contacto');

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
