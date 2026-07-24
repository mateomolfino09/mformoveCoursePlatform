import { routes } from '../constants/routes';
import type { MentorshipBillingInterval } from '../lib/mentorshipPricing';
import type { LinkInBioProductCard } from './linkInBioProducts';

export type LinkInBioMentoriaConfig = {
  activoEnBio?: boolean;
  /** @deprecated Preferí imagenBioTrimestral / imagenBioAnual. */
  imagenBio?: string;
  imagenBioTrimestral?: string;
  imagenBioAnual?: string;
  titulo?: string;
  subtitulo?: string;
  tituloTrimestral?: string;
  subtituloTrimestral?: string;
  tituloAnual?: string;
  subtituloAnual?: string;
};

function trimId(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Landing de mentoría anclada a planes, con intervalo preseleccionado. */
export function mentorshipPlansLandingHref(
  interval: MentorshipBillingInterval = 'trimestral',
): string {
  return `${routes.navegation.mentoria}?interval=${interval}#mentorship-plans`;
}

/** Una o dos cards de mentoría (trimestral / anual) para el carrusel de /bio. */
export function buildMentoriaLinkInBioCards(
  config: LinkInBioMentoriaConfig | null | undefined
): LinkInBioProductCard[] {
  if (!config || config.activoEnBio === false) return [];

  const baseTitle = trimId(config.titulo) || 'Mentoría 1:1';
  const baseSubtitle = trimId(config.subtitulo) || 'Acompañamiento personalizado';

  const imagenTri = trimId(config.imagenBioTrimestral);
  const imagenAnual = trimId(config.imagenBioAnual);
  const imagenLegacy = trimId(config.imagenBio);

  // Compat: solo la imagen vieja → una card genérica
  if (!imagenTri && !imagenAnual && imagenLegacy) {
    return [
      {
        id: 'mentoria',
        title: baseTitle,
        subtitle: baseSubtitle,
        imageSrc: imagenLegacy,
        href: mentorshipPlansLandingHref('trimestral'),
        tipo: 'mentoria',
      },
    ];
  }

  const cards: LinkInBioProductCard[] = [];

  if (imagenAnual) {
    cards.push({
      id: 'mentoria-anual',
      title: trimId(config.tituloAnual) || `${baseTitle} · Anual`,
      subtitle: trimId(config.subtituloAnual) || '12 meses · beneficios y bonos exclusivos',
      imageSrc: imagenAnual,
      href: mentorshipPlansLandingHref('anual'),
      tipo: 'mentoria',
    });
  }

  if (imagenTri) {
    cards.push({
      id: 'mentoria-trimestral',
      title: trimId(config.tituloTrimestral) || `${baseTitle} · Trimestral`,
      subtitle: trimId(config.subtituloTrimestral) || 'Ciclo de 3 meses · seguimiento personalizado',
      imageSrc: imagenTri,
      href: mentorshipPlansLandingHref('trimestral'),
      tipo: 'mentoria',
    });
  }

  return cards;
}

/** @deprecated Usá buildMentoriaLinkInBioCards. */
export function buildMentoriaLinkInBioCard(
  config: LinkInBioMentoriaConfig | null | undefined
): LinkInBioProductCard | null {
  return buildMentoriaLinkInBioCards(config)[0] ?? null;
}
