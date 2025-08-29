import React from "react"
import { BoldFont, MontserratFont } from "../../utils/customFonts"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Productos MForMove - Clases, Eventos y Recursos de Movimiento Consciente',
  description: 'Explora nuestra colección de productos de movimiento consciente: clases online, eventos presenciales, recursos descargables y programas transformacionales para tu desarrollo personal.',
  keywords: [
    'clases online movimiento',
    'eventos presenciales',
    'recursos fitness',
    'programas transformacionales',
    'MForMove',
    'movimiento consciente',
    'bienestar integral',
    'desarrollo personal'
  ],
  openGraph: {
    title: 'Productos MForMove - Movimiento Consciente',
    description: 'Explora nuestra colección de productos de movimiento consciente: clases, eventos y recursos.',
    url: 'https://mformove.com/products',
    siteName: 'MForMove',
    locale: 'es_UY',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <section className={`${BoldFont.variable} ${MontserratFont.variable}`}>
        {children}
    </section>
  )
}
