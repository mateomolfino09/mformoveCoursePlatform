import React from 'react';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear Cuenta - MForMove',
  description: 'Únete a la comunidad MForMove y comienza tu transformación personal. Crea tu cuenta de forma segura y accede a clases, eventos y recursos de movimiento consciente.',
  keywords: [
    'registro',
    'crear cuenta',
    'MForMove',
    'movimiento consciente',
    'comunidad fitness',
    'bienestar integral'
  ],
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
          {children}
    </section>
  )
}