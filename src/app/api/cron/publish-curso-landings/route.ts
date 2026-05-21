import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import { parseCursoPublicationDate } from '../../../../lib/cursoLandingPublication';

export const dynamic = 'force-dynamic';

function isAuthorizedCron(req: NextRequest): boolean {
  const tokenFromQuery = new URL(req.url).searchParams.get('token');
  const authHeader =
    req.headers.get('x-cron-secret') ||
    req.headers.get('Authorization') ||
    req.headers.get('authorization');
  const auth = tokenFromQuery ? `Bearer ${tokenFromQuery}` : authHeader;
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  return Boolean(auth && auth.trim() === expected.trim());
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorizedCron(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const products = await Product.find({
      tipo: 'curso',
      'cursoConfig.publicado': { $ne: true },
      'cursoConfig.fechaPublicacion': { $ne: null },
    });

    const published: Array<{ productId: string; slug: string; fechaPublicacion: string }> = [];

    for (const product of products) {
      const cursoConfig = product.cursoConfig;
      if (!cursoConfig) continue;

      const publicationDate = parseCursoPublicationDate(cursoConfig.fechaPublicacion);
      if (!publicationDate || publicationDate.getTime() > now.getTime()) continue;

      cursoConfig.publicado = true;
      product.markModified('cursoConfig');
      await product.save();

      published.push({
        productId: product._id.toString(),
        slug: cursoConfig.slug || '',
        fechaPublicacion: publicationDate.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      checkedAt: now.toISOString(),
      publishedCount: published.length,
      published,
      message:
        published.length > 0
          ? 'Landings de curso publicadas según fecha programada.'
          : 'No había landings de curso pendientes de publicación.',
    });
  } catch (error) {
    console.error('[cron publish-curso-landings]', error);
    return NextResponse.json(
      { error: 'Error interno', details: (error as Error).message },
      { status: 500 }
    );
  }
}
