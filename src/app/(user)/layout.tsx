import React from "react"
import UserHeader from "../../components/UserHeader"

export const metadata = {
  title: 'Ingresa a tu cuenta',
  description: 'Accede a tu cuenta personal de MForMove. Gestiona tu perfil, suscripciones y accede a todo el contenido exclusivo de movimiento consciente.',
  keywords: "movimiento, fitness, yoga, meditacion, calistenia, workout, training, bienestar, transformacion personal"
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <section className="font-montserrat">
        {children}
    </section>
  )
}
