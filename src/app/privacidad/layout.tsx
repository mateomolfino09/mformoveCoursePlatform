import type { Metadata } from 'next';
import { pageMetadata } from '../../lib/pageMetadata';

export const metadata: Metadata = pageMetadata('Política de privacidad');

export default function PrivacidadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
