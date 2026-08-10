import Product from '../models/productModel';
import { cursoLandingPath } from './cursoPaths';
import { MENTORSHIP_LANDING_CTA } from '../constants/mentorshipCta';
import { isCursoLandingPublished } from './cursoLandingPublication';

export type FreeSequentialCta = {
  href: string;
  label: string;
  source: 'product' | 'mentorship';
  productId: string | null;
};

type SecuenciaConfigLike = {
  ctaProductId?: unknown;
  ctaLabel?: string | null;
} | null | undefined;

function mentorshipCta(labelOverride?: string | null): FreeSequentialCta {
  const label = typeof labelOverride === 'string' && labelOverride.trim()
    ? labelOverride.trim()
    : MENTORSHIP_LANDING_CTA.label;
  return {
    href: MENTORSHIP_LANDING_CTA.href,
    label,
    source: 'mentorship',
    productId: null,
  };
}

/**
 * Resuelve el CTA inferior de una clase gratuita secuencial.
 * Sin `ctaProductId` (o producto inválido/sin URL pública) → mentoría.
 */
export async function resolveFreeSequentialCta(
  secuenciaConfig: SecuenciaConfigLike
): Promise<FreeSequentialCta> {
  const labelOverride =
    typeof secuenciaConfig?.ctaLabel === 'string' ? secuenciaConfig.ctaLabel : '';
  const rawId = secuenciaConfig?.ctaProductId;
  const productId =
    rawId != null && String(rawId).trim() !== '' ? String(rawId) : null;

  if (!productId) {
    return mentorshipCta(labelOverride);
  }

  try {
    const product = await Product.findById(productId)
      .select('nombre tipo activo cursoConfig')
      .lean();

    if (!product || product.activo === false) {
      return mentorshipCta(labelOverride);
    }

    if (product.tipo === 'curso') {
      const cfg = product.cursoConfig as Record<string, unknown> | undefined;
      const slug = typeof cfg?.slug === 'string' ? cfg.slug.trim() : '';
      if (slug && isCursoLandingPublished(cfg)) {
        return {
          href: cursoLandingPath(slug),
          label:
            (labelOverride && labelOverride.trim()) ||
            (typeof product.nombre === 'string' && product.nombre.trim()) ||
            'Ver producto',
          source: 'product',
          productId: String(product._id),
        };
      }
    }

    return mentorshipCta(labelOverride);
  } catch {
    return mentorshipCta(labelOverride);
  }
}
