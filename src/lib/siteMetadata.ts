import type { Metadata } from 'next';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.mateomove.com'
).replace(/\/$/, '');

export const GLOBAL_SITE_TITLE = 'MMOVE';

export const GLOBAL_SITE_DESCRIPTION =
  'Educación de movimiento con criterio técnico. Programas, mentoría y recursos para personas que quieren entender su cuerpo y saber exactamente qué hacer con él.';

export const GLOBAL_SITE_KEYWORDS = [
  'MMOVE',
  'Mateo Molfino',
  'método de movimiento',
  'autonomía corporal',
  'movilidad',
  'educación corporal',
  'programa de movimiento',
];

export const globalSiteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: GLOBAL_SITE_TITLE,
    template: '%s',
  },
  description: GLOBAL_SITE_DESCRIPTION,
  keywords: GLOBAL_SITE_KEYWORDS,
  applicationName: 'MMOVE',
  authors: [{ name: 'Mateo Molfino' }],
  creator: 'Mateo Molfino',
  openGraph: {
    type: 'website',
    locale: 'es_UY',
    url: SITE_URL,
    siteName: 'MMOVE',
    title: GLOBAL_SITE_TITLE,
    description: GLOBAL_SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: GLOBAL_SITE_TITLE,
    description: GLOBAL_SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};
