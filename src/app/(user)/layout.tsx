import React from "react"
import UserHeader from "../../components/UserHeader"

export const metadata = {
  title: 'Mformove',
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
        <UserHeader />
        {children}
    </section>
  )
}
