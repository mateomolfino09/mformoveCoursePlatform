import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mi cuenta',
  description:
    'Gestioná tu perfil, facturación, programas y acceso a contenido en MMOVE.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
