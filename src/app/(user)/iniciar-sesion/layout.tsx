import type { Metadata } from 'next';
import { pageMetadata } from '../../../lib/pageMetadata';

export const metadata: Metadata = pageMetadata('Iniciar sesión');

export default function IniciarSesionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
