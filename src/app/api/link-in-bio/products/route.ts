import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import LinkInBioConfig from '../../../../models/linkInBioConfigModel';
import { getLatestPublishedCursoPayload } from '../../../../lib/latestPublishedCurso';
import { buildMentoriaLinkInBioCards } from '../../../../lib/linkInBioMentoria';
import { mapProductsForLinkInBio } from '../../../../lib/linkInBioProducts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Mismos productos que /bio (con precio de lista cuando existe). */
export async function GET() {
  try {
    const [latestCurso, productsRaw, bioConfig] = await Promise.all([
      getLatestPublishedCursoPayload(),
      (async () => {
        await connectDB();
        const docs = await Product.find({ activo: { $ne: false } })
          .select(
            'nombre name descripcion description tipo productType portada portadaMobile imagenBio image_url imagenes url cursoConfig precio price moneda currency phraseName activo online ubicacion fecha createdAt updatedAt'
          )
          .lean();
        return JSON.parse(JSON.stringify(docs)) as Record<string, unknown>[];
      })(),
      (async () => {
        await connectDB();
        const doc = await LinkInBioConfig.findOne({ key: 'default' }).lean();
        return doc ? JSON.parse(JSON.stringify(doc)) : null;
      })(),
    ]);

    const mentoriaCards = buildMentoriaLinkInBioCards(bioConfig?.mentoria);
    const products = mapProductsForLinkInBio(productsRaw, mentoriaCards, {
      featuredCursoSlug: latestCurso?.slug ?? null,
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('[link-in-bio/products]', error);
    return NextResponse.json(
      { error: 'No se pudieron cargar los productos', products: [] },
      { status: 500 }
    );
  }
}
