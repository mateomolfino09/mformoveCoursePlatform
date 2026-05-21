import connectDB from '../config/connectDB';
import Product from '../models/productModel';
import { isCursoLandingPublished } from './cursoLandingPublication';
import { getLatestPublishedCursoPayload } from './latestPublishedCurso';
import { normalizeCursoLandingConfig } from '../types/cursoLanding';
import { resolveInvitacionGrupoWhatsappFromProduct } from './resolveInvitacionGrupoWhatsapp';

export type CursoCommunitySnippet = {
  slug: string;
  titulo: string;
  descripcion: string;
  /** Invitación al grupo del curso (variable). Null si no está configurada. */
  invitacionGrupoWhatsapp: string | null;
  ctaTexto: string;
};

export async function getCursoCommunitySnippet(slug?: string | null): Promise<CursoCommunitySnippet | null> {
  await connectDB();

  let resolvedSlug = slug?.trim().toLowerCase() || '';

  if (!resolvedSlug) {
    const latest = await getLatestPublishedCursoPayload();
    if (!latest?.slug) return null;
    resolvedSlug = latest.slug;
  }

  const product = await Product.findOne({
    tipo: 'curso',
    'cursoConfig.slug': resolvedSlug,
  })
    .select('nombre cursoConfig invitacionGrupoWhatsapp grupoWhatsapp')
    .lean();

  if (!product) return null;

  const cfg = product.cursoConfig as Record<string, unknown> | undefined;
  if (!isCursoLandingPublished(cfg)) return null;

  const nombre = typeof product.nombre === 'string' ? product.nombre.trim() : 'Curso';
  const cursoConfig = normalizeCursoLandingConfig(cfg, nombre);
  const programa = cursoConfig.introHighlights.titulo || nombre;
  const invitacion = resolveInvitacionGrupoWhatsappFromProduct(product);

  return {
    slug: resolvedSlug,
    titulo: `Comunidad ${programa}`,
    descripcion:
      'Accedé al grupo privado de WhatsApp para soporte, avisos y novedades del programa.',
    invitacionGrupoWhatsapp: invitacion || null,
    ctaTexto: cursoConfig.whatsapp.ctaTexto || 'Unirme al grupo',
  };
}
