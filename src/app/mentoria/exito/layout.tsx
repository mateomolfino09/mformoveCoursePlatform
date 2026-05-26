import type { Metadata } from 'next';
import { pageMetadata } from '../../../lib/pageMetadata';

export const metadata: Metadata = pageMetadata('Mentoría confirmada');

export default function MentoriaExitoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
