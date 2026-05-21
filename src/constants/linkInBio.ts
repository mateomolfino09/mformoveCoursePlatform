import { routes } from './routes';
import { SITE_CONTACT_EMAIL, getSiteWhatsappUrl } from '../lib/siteContact';

/** Hero /bio — Cloudinary public id */
export const LINK_IN_BIO_HERO_PUBLIC_ID = 'my_uploads/fondos/IMG_4314_va6kfb_1_vxfvcg';

/** Fondo difuminado en desktop (laterales negros). Por ahora reutiliza el hero; reemplazá cuando tengas el asset final. */
export const LINK_IN_BIO_DESKTOP_BACKDROP_PUBLIC_ID = LINK_IN_BIO_HERO_PUBLIC_ID;

/** Ancho columna crema: centro fijo tipo mobile vs columna más ancha en desktop. */
export const LINK_IN_BIO_CONTENT_WIDTH_PX = 430;
export const LINK_IN_BIO_COLUMN_DESKTOP_WIDTH_PX = 520;

export const LINK_IN_BIO_SOCIAL = {
  instagram: 'https://www.instagram.com/mateo.move/',
  youtube: 'https://www.youtube.com/@mateomolfino4254',
  email: SITE_CONTACT_EMAIL,
  whatsapp: getSiteWhatsappUrl(),
} as const;

export function getLinkInBioMetodoHref(latestCursoSlug?: string | null): string {
  return latestCursoSlug
    ? routes.navegation.membership.curso(latestCursoSlug)
    : routes.navegation.moveCrew;
}

export type LinkInBioLink = {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  external?: boolean;
  featured?: boolean;
};

/** @deprecated lista vertical reemplazada por carrusel de productos */
export function buildLinkInBioLinks(latestCursoSlug?: string | null): LinkInBioLink[] {
  const cursoHref = latestCursoSlug
    ? routes.navegation.membership.curso(latestCursoSlug)
    : routes.navegation.moveCrew;

  return [
    {
      id: 'curso',
      label: 'Cuerpo autónomo',
      subtitle: 'Programa digital de movimiento',
      href: cursoHref,
      featured: true,
    },
    {
      id: 'mentoria',
      label: 'Mentoría 1:1',
      subtitle: 'Acompañamiento personalizado',
      href: routes.navegation.mentorship,
      featured: true,
    },
    {
      id: 'productos',
      label: 'Todos los productos',
      subtitle: 'Cursos, talleres y recursos',
      href: routes.navegation.products,
    },
    {
      id: 'eventos',
      label: 'Eventos y retiros',
      subtitle: 'Experiencias presenciales',
      href: routes.navegation.eventos,
    },
    {
      id: 'planes',
      label: 'Membresía Move',
      subtitle: 'Biblioteca y camino semanal',
      href: routes.navegation.selectPlan,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      subtitle: 'Escribime directo',
      href: LINK_IN_BIO_SOCIAL.whatsapp,
      external: true,
    },
    {
      id: 'contacto',
      label: 'Contacto',
      subtitle: 'Formulario y consultas',
      href: routes.navegation.contact,
    },
  ];
}
