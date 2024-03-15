import React from "react"
import UserHeader from "../../components/UserHeader"

export const metadata = {
  title: 'Ingresa a tu cuenta',
  description: 'Bienvenido a mformove!',
  keywords: "movimiento, fitness, yoga, meditacion, calistenia, workout, training"
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <section>
        <UserHeader />
        {children}
    </section>
  )
}
