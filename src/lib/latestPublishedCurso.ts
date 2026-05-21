import connectDB from '../config/connectDB';
import Product from '../models/productModel';
import { isCursoLandingPublished, parseCursoPublicationDate } from './cursoLandingPublication';
import type { IndexLatestCursoModulo, IndexLatestCursoPayload } from '../types/indexLatestCurso';

function publicationSortTime(product: Record<string, unknown>): number {
  const cfg = product.cursoConfig as Record<string, unknown> | undefined;
  const fromCfg = parseCursoPublicationDate(cfg?.fechaPublicacion);
  if (fromCfg) return fromCfg.getTime();
  const updated = product.updatedAt ? new Date(product.updatedAt as string | Date).getTime() : 0;
  return updated;
}

/** Entre cursos publicados, el más reciente por fecha de creación en BD (fallback updatedAt). */
function createdSortTime(product: Record<string, unknown>): number {
  const created = product.createdAt ? new Date(product.createdAt as string | Date).getTime() : 0;
  if (created) return created;
  return publicationSortTime(product);
}

/**
 * Último curso con landing publicada (por fecha de creación del producto).
 */
export async function getLatestPublishedCursoPayload(): Promise<IndexLatestCursoPayload | null> {
  await connectDB();

  const products = await Product.find({ tipo: 'curso' })
    .select('nombre cursoConfig updatedAt createdAt')
    .lean();

  const published = products.filter((p: Record<string, unknown>) => {
    const cfg = p.cursoConfig as Record<string, unknown> | undefined;
    const slugRaw = typeof cfg?.slug === 'string' ? cfg.slug.trim() : '';
    return Boolean(slugRaw && isCursoLandingPublished(cfg as Parameters<typeof isCursoLandingPublished>[0]));
  });

  published.sort((a, b) => createdSortTime(b) - createdSortTime(a));

  const top = published[0] as Record<string, unknown> | undefined;
  if (!top) return null;

  const cfg = top.cursoConfig as Record<string, unknown>;
  const slug = String(cfg.slug).trim().toLowerCase();
  const intro = (cfg.introHighlights || {}) as Record<string, unknown>;
  const hero = (cfg.hero || {}) as Record<string, unknown>;
  const queIncluye = (cfg.queIncluye || {}) as Record<string, unknown>;
  const temarioTitulo =
    typeof queIncluye.titulo === 'string' && queIncluye.titulo.trim()
      ? queIncluye.titulo.trim()
      : 'Módulos del programa';
  const nombre = typeof top.nombre === 'string' ? top.nombre.trim() : '';

  const titulo =
    typeof intro.titulo === 'string' && intro.titulo.trim()
      ? intro.titulo.trim()
      : nombre || slug;

  const subtitulo =
    typeof intro.subtitulo === 'string' && intro.subtitulo.trim()
      ? intro.subtitulo.trim()
      : typeof hero.tagline === 'string' && hero.tagline.trim()
        ? hero.tagline.trim()
        : '';

  const cuerpoRaw = typeof intro.cuerpo === 'string' ? intro.cuerpo.trim() : '';
  const cuerpoIntro = cuerpoRaw.length > 520 ? `${cuerpoRaw.slice(0, 517).trim()}…` : cuerpoRaw;

  const imagenIntroPublicId =
    (typeof intro.imagenDesktopPublicId === 'string' && intro.imagenDesktopPublicId.trim()) ||
    (typeof intro.imagenMobilePublicId === 'string' && intro.imagenMobilePublicId.trim()) ||
    '';

  const rawMods = Array.isArray(queIncluye.modulos) ? queIncluye.modulos : [];
  const modulos: IndexLatestCursoModulo[] = rawMods.slice(0, 5).map((m: Record<string, unknown>) => ({
    titulo: typeof m.titulo === 'string' ? m.titulo : '',
    descripcion: typeof m.descripcion === 'string' ? m.descripcion : '',
    imagenPublicId: typeof m.imagenPublicId === 'string' ? m.imagenPublicId : '',
  }));

  return {
    slug,
    titulo,
    subtitulo,
    cuerpoIntro,
    imagenIntroPublicId,
    temarioTitulo,
    modulos,
  };
}
