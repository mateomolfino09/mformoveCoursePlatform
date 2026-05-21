import type { Metadata } from 'next';
import LinkInBioPage from '../../components/PageComponent/LinkInBio/LinkInBioPage';
import connectDB from '../../config/connectDB';
import Product from '../../models/productModel';
import { getLatestPublishedCursoPayload } from '../../lib/latestPublishedCurso';
import LinkInBioConfig from '../../models/linkInBioConfigModel';
import { buildMentoriaLinkInBioCard } from '../../lib/linkInBioMentoria';
import { mapProductsForLinkInBio } from '../../lib/linkInBioProducts';

export const metadata: Metadata = {
  title: 'Mateo Molfino | Bio',
  description:
    'Todos los caminos de Mateo Move: programas, mentoría, productos, eventos y contacto.',
  openGraph: {
    title: 'Mateo Molfino (@mateo.move)',
    description: 'Programas, mentoría, productos y contacto en un solo lugar.',
    type: 'website',
  },
};

export default async function BioPage() {
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

  const mentoriaCard = buildMentoriaLinkInBioCard(bioConfig?.mentoria);
  const products = mapProductsForLinkInBio(productsRaw, mentoriaCard ? [mentoriaCard] : [], {
    featuredCursoSlug: latestCurso?.slug ?? null,
  });

  return (
    <LinkInBioPage
      latestCursoSlug={latestCurso?.slug ?? null}
      products={products}
    />
  );
}
