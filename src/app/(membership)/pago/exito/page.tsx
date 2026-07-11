import type { Metadata } from 'next';
import { Suspense } from 'react';
import Success from '../../../../components/PageComponent/MembershipActions/Success';
import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import { formatTitleCaseWords } from '../../../../lib/formatDisplayTitle';
import { resolveCursoProductCoverUrl } from '../../../../lib/resolveMediaImageUrl';

export const dynamic = 'force-dynamic';

type SearchParams = {
  productId?: string;
  tipo?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const productId = searchParams.productId?.trim();
  if (!productId) {
    return {
      title: 'Pago confirmado',
      description: 'Tu pago fue confirmado en MMOVE Online.',
    };
  }

  try {
    await connectDB();
    const product = await Product.findById(productId).lean();
    if (!product) {
      return { title: 'Pago confirmado' };
    }

    const courseName = formatTitleCaseWords(
      (product.nombre || product.name || 'tu curso') as string
    );
    const coverImage = resolveCursoProductCoverUrl(product);

    return {
      title: `Te doy la bienvenida a ${courseName}`,
      description: 'Tu pago fue confirmado. Accedé a tu contenido en MMOVE Online.',
      openGraph: {
        title: `Te doy la bienvenida a ${courseName}`,
        description: 'Tu pago fue confirmado en MMOVE Online.',
        type: 'website',
        images: [
          {
            url: coverImage,
            width: 1200,
            height: 630,
            alt: courseName,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Te doy la bienvenida a ${courseName}`,
        images: [coverImage],
      },
    };
  } catch {
    return { title: 'Pago confirmado' };
  }
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Success />
    </Suspense>
  );
}
