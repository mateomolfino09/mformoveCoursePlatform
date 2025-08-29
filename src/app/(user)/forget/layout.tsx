import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Recuperar Contraseña - MForMove',
  description: 'Recupera el acceso a tu cuenta de MForMove de forma segura. Recibe instrucciones por email para restablecer tu contraseña y continuar tu viaje de movimiento consciente.',
  keywords: [
    'recuperar contraseña',
    'reset password',
    'MForMove',
    'cuenta segura',
    'movimiento consciente'
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