import type { Metadata } from 'next';
import { pageMetadata } from '../../../lib/pageMetadata';

export const metadata: Metadata = pageMetadata('Consulta de mentoría');

export default function MentoriaConsultaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
