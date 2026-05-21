import React from "react"
import UserHeader from "../../../components/UserHeader"
import ProfileHeader from "../../../components/ProfileHeader"

export const metadata = {
  title: 'Mi Cuenta - MForMove',
  description: 'Tu centro de control personal. Gestiona tu perfil, facturación, suscripciones y accede a tu historial de clases y eventos de MForMove.',
  keywords: "movimiento, fitness, yoga, meditacion, calistenia, workout, training, bienestar, transformacion personal"
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
