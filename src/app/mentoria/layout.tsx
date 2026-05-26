import type { Metadata } from 'next';
import { SITE_URL } from '../../lib/siteMetadata';

export const metadata: Metadata = {
  title: 'Mentoría 1:1',
  description:
    'Mentoría personalizada en movimiento con Mateo Molfino. Seguimiento técnico, feedback y estructura para handbalance, movilidad y locomociones.',
  keywords: [
    'mentoría movimiento',
    'Mateo Molfino',
    'MMOVE',
    'handbalance',
    'movilidad',
    'locomociones',
    'educación corporal',
    'seguimiento técnico',
  ],
  openGraph: {
    title: 'Mentoría 1:1',
    description:
      'Acompañamiento personalizado en movimiento con criterio técnico. Planes trimestrales con Mateo Molfino.',
    url: `${SITE_URL}/mentoria`,
    siteName: 'MMOVE',
    images: [
      {
        url: '/images/bgIndex2.jpg',
        width: 1200,
        height: 630,
        alt: 'Mentoría MMOVE — Mateo Molfino',
      },
    ],
    locale: 'es_UY',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mentoría 1:1',
    description:
      'Mentoría personalizada en movimiento con Mateo Molfino. Seguimiento técnico y estructura clara.',
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
    canonical: `${SITE_URL}/mentoria`,
  },
};

export default function MentorshipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
