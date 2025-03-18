import React from "react"
import UserHeader from "../../../components/UserHeader"
import ProfileHeader from "../../../components/ProfileHeader"

export const metadata = {
  title: 'Ingresa a tu cuenta',
  description: 'Bienvenido a mformove!',
  keywords: "movimiento, fitness, yoga, meditacion, calistenia, workout, training"
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
