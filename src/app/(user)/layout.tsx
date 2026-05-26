import React from 'react';
import type { Metadata } from 'next';
import { GLOBAL_SITE_KEYWORDS } from '../../lib/siteMetadata';

// Título por ruta: cada sub-layout (iniciar-sesión, registro, cuenta…) define el suyo.
export const metadata: Metadata = {
  description:
    'Accede a tu cuenta en MMOVE para gestionar perfil, programas contratados y mentoría.',
  keywords: GLOBAL_SITE_KEYWORDS,
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="font-montserrat">{children}</section>;
}
