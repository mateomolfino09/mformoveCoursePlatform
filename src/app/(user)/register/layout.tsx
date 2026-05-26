import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description:
    'Creá tu cuenta en MMOVE para acceder a programas, mentoría y recursos de educación de movimiento.',
  keywords: ['registro', 'crear cuenta', 'MMOVE', 'Mateo Molfino', 'educación corporal'],
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
