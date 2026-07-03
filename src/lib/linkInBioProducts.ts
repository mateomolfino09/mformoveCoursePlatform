import { isCursoLandingPublished } from './cursoLandingPublication';
import { routes } from '../constants/routes';
import { resolveProductImagePublicId } from './resolveMediaImageUrl';

export type LinkInBioProductCard = {
  id: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  href: string;
  tipo: string;
};

export type MapProductsForLinkInBioOptions = {
  /** Curso en la primera posición (p. ej. el último publicado). */
  featuredCursoSlug?: string | null;
};

/** Índice inicial del carrusel (mentoría = segunda tarjeta). */
export const LINK_IN_BIO_CAROUSEL_INITIAL_INDEX = 1;

function slugifyEventName(nombre: string): string {
  return nombre.replace(/\s+/g, '-').toLowerCase();
}

function trimText(value: unknown, max = 90): string {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return '';
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function resolveProductHref(product: Record<string, unknown>): string | null {
  const tipo = String(product.tipo || product.productType || '').toLowerCase();
  const nombre = String(product.nombre || product.name || '').trim();

  if (tipo === 'curso') {
    const cfg = product.cursoConfig as Record<string, unknown> | undefined;
    const slug = typeof cfg?.slug === 'string' ? cfg.slug.trim() : '';
    if (!slug || !isCursoLandingPublished(cfg as Parameters<typeof isCursoLandingPublished>[0])) {
      return null;
    }
    return routes.navegation.membership.curso(slug);
  }

  if (tipo === 'evento') {
    if (!nombre) return null;
    return `${routes.navegation.eventos}/${slugifyEventName(nombre)}`;
  }

  const url = String(product.url || '').trim();
  if (url) return `/productos/${url}`;

  return null;
}

function resolveProductImage(product: Record<string, unknown>): string {
  return resolveProductImagePublicId(product as Parameters<typeof resolveProductImagePublicId>[0]);
}

function resolveProductSubtitle(product: Record<string, unknown>): string {
  const cfg = product.cursoConfig as Record<string, unknown> | undefined;
  const hero = cfg?.hero as Record<string, unknown> | undefined;
  const tipo = String(product.tipo || product.productType || '').toLowerCase();

  if (typeof hero?.subtitulo === 'string' && hero.subtitulo.trim()) {
    return trimText(hero.subtitulo, 100);
  }
  if (typeof product.descripcion === 'string' && product.descripcion.trim()) {
    return trimText(product.descripcion, 100);
  }
  if (typeof product.description === 'string' && product.description.trim()) {
    return trimText(product.description, 100);
  }
  if (tipo === 'evento' && product.online) return 'Evento online';
  if (tipo === 'evento' && product.ubicacion) {
    const u = product.ubicacion as Record<string, unknown>;
    const ciudad = typeof u.ciudad === 'string' ? u.ciudad : '';
    return trimText(ciudad ? `Presencial · ${ciudad}` : 'Evento presencial', 100);
  }
  if (typeof product.phraseName === 'string' && product.phraseName.trim()) {
    return trimText(product.phraseName, 100);
  }

  const precio = product.precio ?? product.price;
  const moneda = product.moneda || product.currency;
  if (precio != null && moneda) {
    return `${precio} ${moneda}`;
  }

  return '';
}

function getCursoSlug(product: Record<string, unknown>): string {
  const cfg = product.cursoConfig as Record<string, unknown> | undefined;
  return typeof cfg?.slug === 'string' ? cfg.slug.trim().toLowerCase() : '';
}

function productId(product: Record<string, unknown>): string {
  return String(product._id || product.nombre || product.name || '');
}

function cursoCreatedSortTime(product: Record<string, unknown>): number {
  const created = product.createdAt ? new Date(product.createdAt as string | Date).getTime() : 0;
  if (created) return created;
  const updated = product.updatedAt ? new Date(product.updatedAt as string | Date).getTime() : 0;
  return updated;
}

/** Evento con fecha futura o sin fecha definida (misma regla que /eventos). */
export function isEventoVigente(product: Record<string, unknown>, now = new Date()): boolean {
  const tipo = String(product.tipo || product.productType || '').toLowerCase();
  if (tipo !== 'evento') return true;
  if (product.fecha == null || product.fecha === undefined || product.fecha === '') {
    return true;
  }
  const fecha = new Date(product.fecha as string | Date);
  if (Number.isNaN(fecha.getTime())) return true;
  return fecha >= now;
}

function eventoFechaSortTime(product: Record<string, unknown>): number {
  if (product.fecha == null || product.fecha === undefined || product.fecha === '') {
    return Number.MAX_SAFE_INTEGER;
  }
  const fecha = new Date(product.fecha as string | Date);
  return Number.isNaN(fecha.getTime()) ? Number.MAX_SAFE_INTEGER : fecha.getTime();
}

function rawToCard(raw: Record<string, unknown>): LinkInBioProductCard | null {
  if (raw.activo === false) return null;

  const tipo = String(raw.tipo || raw.productType || 'otro').toLowerCase();
  if (tipo === 'evento' && !isEventoVigente(raw)) return null;

  const href = resolveProductHref(raw);
  if (!href) return null;

  const imageSrc = resolveProductImage(raw);
  if (!imageSrc) return null;

  const title = String(raw.nombre || raw.name || '').trim();
  if (!title) return null;

  return {
    id: productId(raw),
    title,
    subtitle: resolveProductSubtitle(raw),
    imageSrc,
    href,
    tipo,
  };
}

function pickFeaturedCursoRaw(
  cursos: Record<string, unknown>[],
  featuredCursoSlug?: string | null
): Record<string, unknown> | null {
  const slugWanted = featuredCursoSlug?.trim().toLowerCase();
  if (slugWanted) {
    const match = cursos.find((p) => getCursoSlug(p) === slugWanted);
    if (match) return match;
  }

  const sorted = [...cursos].sort((a, b) => cursoCreatedSortTime(b) - cursoCreatedSortTime(a));
  return sorted[0] ?? null;
}

function pickVigenteEventoRaw(eventos: Record<string, unknown>[]): Record<string, unknown> | null {
  const vigentes = eventos.filter(isEventoVigente);
  if (vigentes.length === 0) return null;
  vigentes.sort((a, b) => eventoFechaSortTime(a) - eventoFechaSortTime(b));
  return vigentes[0];
}

function resolveMentoriaCard(extraCards: LinkInBioProductCard[]): LinkInBioProductCard | null {
  for (const extra of extraCards) {
    if (!extra?.imageSrc?.trim() || !extra?.href) continue;
    return { ...extra, tipo: extra.tipo || 'mentoria' };
  }
  return null;
}

export function mapProductsForLinkInBio(
  products: Record<string, unknown>[],
  extraCards: LinkInBioProductCard[] = [],
  options: MapProductsForLinkInBioOptions = {}
): LinkInBioProductCard[] {
  const { featuredCursoSlug } = options;

  const cursoRaws: Record<string, unknown>[] = [];
  const eventoRaws: Record<string, unknown>[] = [];

  for (const raw of products) {
    const tipo = String(raw.tipo || raw.productType || '').toLowerCase();
    if (tipo === 'curso' && resolveProductHref(raw)) {
      cursoRaws.push(raw);
    } else if (tipo === 'evento') {
      eventoRaws.push(raw);
    }
  }

  const featuredRaw = pickFeaturedCursoRaw(cursoRaws, featuredCursoSlug);
  const featuredId = featuredRaw ? productId(featuredRaw) : '';
  const eventoRaw = pickVigenteEventoRaw(eventoRaws);
  const eventoId = eventoRaw ? productId(eventoRaw) : '';

  const featuredCard = featuredRaw ? rawToCard(featuredRaw) : null;
  const eventoCard = eventoRaw ? rawToCard(eventoRaw) : null;
  const mentoriaCard = resolveMentoriaCard(extraCards);

  const otherCursoCards: LinkInBioProductCard[] = [];
  for (const raw of cursoRaws) {
    if (productId(raw) === featuredId) continue;
    const card = rawToCard(raw);
    if (card) otherCursoCards.push(card);
  }
  otherCursoCards.sort((a, b) => a.title.localeCompare(b.title, 'es'));

  const ordered: LinkInBioProductCard[] = [];
  if (featuredCard) ordered.push(featuredCard);
  if (mentoriaCard) ordered.push(mentoriaCard);
  if (eventoCard) ordered.push(eventoCard);
  ordered.push(...otherCursoCards);

  return ordered;
}
