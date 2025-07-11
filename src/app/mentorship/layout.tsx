import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentoría MForMove - Movimiento Consciente Personalizado | Mateo Molfino',
  description: 'Transforma tu relación con el movimiento a través de mentoría personalizada 1:1 con Mateo Molfino. Planes trimestrales desde $350 USD. Evaluación inicial, seguimiento continuo y formación teórica.',
  keywords: [
    'mentoría movimiento consciente',
    'entrenamiento personalizado',
    'Mateo Molfino',
    'MForMove',
    'movimiento funcional',
    'anatomía funcional',
    'pedagogía del cuerpo',
    'entrenamiento online',
    'movimiento consciente',
    'flexibilidad',
    'fuerza',
    'salud corporal'
  ],
  openGraph: {
    title: 'Mentoría MForMove - Movimiento Consciente Personalizado',
    description: 'Transforma tu relación con el movimiento a través de mentoría personalizada 1:1 con Mateo Molfino. Planes trimestrales desde $350 USD.',
    url: 'https://mformove.com/mentorship',
    siteName: 'MForMove',
    images: [
      {
        url: '/images/bgIndex2.jpg',
        width: 1200,
        height: 630,
        alt: 'Mentoría MForMove - Movimiento Consciente',
      },
    ],
    locale: 'es_UY',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mentoría MForMove - Movimiento Consciente Personalizado',
    description: 'Transforma tu relación con el movimiento a través de mentoría personalizada 1:1 con Mateo Molfino.',
    images: ['/images/bgIndex2.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://mformove.com/mentorship',
  },
}

export default function MentorshipLayout({
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