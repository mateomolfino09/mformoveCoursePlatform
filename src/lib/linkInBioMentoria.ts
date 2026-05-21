import { routes } from '../constants/routes';
import type { LinkInBioProductCard } from './linkInBioProducts';

export type LinkInBioMentoriaConfig = {
  activoEnBio?: boolean;
  imagenBio?: string;
  titulo?: string;
  subtitulo?: string;
};

export function buildMentoriaLinkInBioCard(
  config: LinkInBioMentoriaConfig | null | undefined
): LinkInBioProductCard | null {
  if (!config || config.activoEnBio === false) return null;

  const imageSrc = typeof config.imagenBio === 'string' ? config.imagenBio.trim() : '';
  if (!imageSrc) return null;

  const title = (config.titulo || 'Mentoría 1:1').trim();
  const subtitle = (config.subtitulo || 'Acompañamiento personalizado').trim();

  return {
    id: 'mentoria',
    title,
    subtitle,
    imageSrc,
    href: routes.navegation.mentorship,
    tipo: 'mentoria',
  };
}
