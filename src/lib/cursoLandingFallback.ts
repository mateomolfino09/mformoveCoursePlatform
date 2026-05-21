import {
  createDefaultCursoLandingConfig,
  normalizeCursoLandingConfig,
  type CursoLandingConfig,
} from '../types/cursoLanding';

/** Slug del curso principal; landing en /curso/cuerpo-autonomo */
export const CUERPO_AUTONOMO_CURSO_SLUG = 'cuerpo-autonomo';

export function shouldUseCursoLandingFallback(): boolean {
  if (process.env.ENABLE_CURSO_LANDING_FALLBACK === 'true') return true;
  if (process.env.ENABLE_CURSO_LANDING_FALLBACK === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}

export function buildCursoLandingFallbackConfig(
  slug: string,
  nombreProducto = 'Cuerpo autónomo'
): CursoLandingConfig | null {
  const normalizedSlug = slug.trim().toLowerCase();
  if (normalizedSlug !== CUERPO_AUTONOMO_CURSO_SLUG) return null;

  const base = createDefaultCursoLandingConfig(nombreProducto);
  const invitacion =
    process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK?.trim() ||
    'https://chat.whatsapp.com/LgVResfArGjIn9qByXXUSo';

  return normalizeCursoLandingConfig(
    {
      ...base,
      slug: CUERPO_AUTONOMO_CURSO_SLUG,
      publicado: true,
      fechaPublicacion: base.fechaPublicacion ?? new Date().toISOString(),
      whatsapp: {
        ...base.whatsapp,
        invitacionGrupoWhatsapp: invitacion,
      },
    },
    nombreProducto
  );
}

export function buildCursoLandingFallbackProduct(slug: string) {
  const cursoConfig = buildCursoLandingFallbackConfig(slug);
  if (!cursoConfig) return null;

  return {
    nombre: cursoConfig.introHighlights.titulo || 'Cuerpo autónomo',
    name: cursoConfig.introHighlights.titulo || 'Cuerpo autónomo',
    tipo: 'curso' as const,
    descripcion: 'Programa online de movimiento y autonomía física.',
    cursoConfig,
    invitacionGrupoWhatsapp: cursoConfig.whatsapp.invitacionGrupoWhatsapp,
  };
}
