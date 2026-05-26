import connectDB from '../config/connectDB';
import Product from '../models/productModel';
import { formatTitleCaseWords } from './formatDisplayTitle';

function titleFromSlug(slug: string): string {
  return formatTitleCaseWords(slug.replace(/-/g, ' '));
}

/** Título legible del curso para `<title>` y SEO (server-side). */
export async function getCursoPageTitle(slug: string): Promise<string> {
  const normalized = slug?.trim().toLowerCase();
  if (!normalized) return 'Programa';

  try {
    await connectDB();
    const product = (await Product.findOne({
      tipo: 'curso',
      'cursoConfig.slug': normalized,
    })
      .select('nombre cursoConfig.introHighlights.titulo')
      .lean()) as {
      nombre?: string;
      cursoConfig?: { introHighlights?: { titulo?: string } };
    } | null;

    if (product) {
      const raw =
        product.nombre?.trim() ||
        product.cursoConfig?.introHighlights?.titulo?.trim() ||
        '';
      if (raw) return formatTitleCaseWords(raw);
    }
  } catch {
    // fallback al slug
  }

  return titleFromSlug(normalized);
}
