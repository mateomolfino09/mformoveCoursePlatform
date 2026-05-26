import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recuperar contraseña',
  description: 'Recuperá el acceso a tu cuenta de MMOVE. Te enviamos instrucciones por correo.',
  keywords: ['recuperar contraseña', 'MMOVE', 'cuenta'],
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
