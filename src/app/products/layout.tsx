import React from 'react';
import { BoldFont, MontserratFont } from '../../utils/customFonts';
import type { Metadata } from 'next';
import { SITE_URL } from '../../lib/siteMetadata';

export const metadata: Metadata = {
  title: 'Productos | Programas, eventos y recursos',
  description:
    'Programas de movimiento, eventos y recursos de MMOVE. Formación corporal con criterio técnico y estructura clara.',
  keywords: [
    'programas de movimiento',
    'eventos MMOVE',
    'educación corporal',
    'Mateo Molfino',
    'MMOVE',
    'movilidad',
    'autonomía corporal',
  ],
  openGraph: {
    title: 'Productos',
    description:
      'Programas, eventos y recursos de educación de movimiento con criterio técnico.',
    url: `${SITE_URL}/products`,
    siteName: 'MMOVE',
    locale: 'es_UY',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className={`${BoldFont.variable} ${MontserratFont.variable}`}>{children}</section>
  );
}
