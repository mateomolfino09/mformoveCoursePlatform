import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import { isCursoLandingPublished } from '../../../../lib/cursoLandingPublication';
import { formatTitleCaseWords } from '../../../../lib/formatDisplayTitle';

connectDB();

export const dynamic = 'force-dynamic';

export type CursoNavItem = {
  slug: string;
  /** Texto corto para el header (prioriza nombre comercial del bloque intro si existe). */
  label: string;
};

/**
 * Lista mínima de cursos publicados para navegación (header).
 */
export async function GET() {
  try {
    const products = await Product.find({ tipo: 'curso' })
      .select('nombre cursoConfig')
      .lean();

    const items: CursoNavItem[] = products
      .map((p: Record<string, unknown>) => {
        const cfg = p.cursoConfig as Record<string, unknown> | undefined;
        const slugRaw = typeof cfg?.slug === 'string' ? cfg.slug.trim() : '';
        if (!slugRaw) return null;
        if (!isCursoLandingPublished(cfg)) return null;

        const intro = cfg?.introHighlights as Record<string, unknown> | undefined;
        const tituloLanding =
          typeof intro?.titulo === 'string' && intro.titulo.trim()
            ? intro.titulo.trim()
            : null;
        const nombre = typeof p.nombre === 'string' && p.nombre.trim() ? p.nombre.trim() : '';

        const rawLabel = tituloLanding || nombre || slugRaw;
        return {
          slug: slugRaw.toLowerCase(),
          label: formatTitleCaseWords(rawLabel),
        };
      })
      .filter((x): x is CursoNavItem => x != null)
      .sort((a, b) => a.label.localeCompare(b.label, 'es'));

    return NextResponse.json(
      { items },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (e) {
    console.error('[cursos-nav]', e);
    return NextResponse.json({ items: [] as CursoNavItem[] }, { status: 200 });
  }
}
