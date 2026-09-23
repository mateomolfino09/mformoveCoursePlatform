import Product from '../models/productModel';
import { CUERPO_AUTONOMO_COURSE_SLUG } from '../constants/mentorshipCuerpoAutonomoDiscount';

export type GrantableProduct = {
  id: string;
  nombre: string;
  slug: string;
  esSuscripcion: boolean;
  activo: boolean;
};

/**
 * Allowlist opcional de slugs vía MANUAL_GRANT_COURSE_SLUGS (csv).
 * Si la variable está vacía, se pueden otorgar todos los cursos.
 * Cuerpo Autónomo siempre está incluido cuando hay allowlist.
 */
export function resolveManualGrantSlugs(): string[] | null {
  const raw = process.env.MANUAL_GRANT_COURSE_SLUGS?.trim();
  if (!raw) return null;

  const slugs = Array.from(
    new Set(
      raw
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  if (!slugs.includes(CUERPO_AUTONOMO_COURSE_SLUG)) {
    slugs.unshift(CUERPO_AUTONOMO_COURSE_SLUG);
  }

  return slugs;
}

export async function listGrantableProducts(): Promise<GrantableProduct[]> {
  const slugs = resolveManualGrantSlugs();
  const query: Record<string, unknown> = { tipo: 'curso' };
  if (slugs) {
    query['cursoConfig.slug'] = { $in: slugs };
  }

  const products = await Product.find(query)
    .select('_id nombre name cursoConfig.slug esSuscripcion activo')
    .sort({ nombre: 1 })
    .lean();

  return products.map((p: any) => ({
    id: String(p._id),
    nombre: p.nombre || p.name || 'Curso',
    slug: String(p.cursoConfig?.slug || ''),
    esSuscripcion: Boolean(p.esSuscripcion),
    activo: p.activo !== false,
  }));
}

export function isProductGrantable(product: {
  tipo?: string;
  cursoConfig?: { slug?: string } | null;
}): boolean {
  if (product?.tipo !== 'curso') return false;
  const slugs = resolveManualGrantSlugs();
  if (!slugs) return true;
  const slug = String(product.cursoConfig?.slug || '').toLowerCase();
  return slugs.includes(slug);
}
