import connectDB from '../../../../../config/connectDB';
import Product from '../../../../../models/productModel';
import { NextResponse } from 'next/server';
import { isCursoLandingPublished } from '../../../../../lib/cursoLandingPublication';
import { resolveCursoCheckoutPlans } from '../../../../../lib/cursoPricing';
import { ensureCursoPreventaPaymentLinks } from '../../../../../lib/ensureCursoPreventaPaymentLinks';
import { normalizeCursoLandingConfig } from '../../../../../types/cursoLanding';

connectDB();

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug?.trim().toLowerCase();
    if (!slug) {
      return NextResponse.json({ error: 'Slug requerido' }, { status: 400 });
    }

    const product = await Product.findOne({
      tipo: 'curso',
      'cursoConfig.slug': slug,
    }).lean();

    if (!product) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    if (!isCursoLandingPublished(product.cursoConfig)) {
      return NextResponse.json({ error: 'Este curso aún no está publicado' }, { status: 404 });
    }

    let cursoConfig = normalizeCursoLandingConfig(
      product.cursoConfig,
      product.nombre || product.name || 'Curso'
    );

    const origin = new URL(_req.url).origin;
    const cursoConfigWithLinks = await ensureCursoPreventaPaymentLinks(
      { ...product, cursoConfig },
      origin
    );
    if (cursoConfigWithLinks && cursoConfigWithLinks !== product.cursoConfig) {
      cursoConfig = normalizeCursoLandingConfig(
        cursoConfigWithLinks,
        product.nombre || product.name || 'Curso'
      );
      await Product.updateOne(
        { _id: product._id },
        { $set: { 'cursoConfig.preciosPreventa': cursoConfig.preciosPreventa } }
      );
    }

    const pricing = resolveCursoCheckoutPlans(cursoConfig);

    return NextResponse.json(
      {
        product: { ...product, cursoConfig },
        cursoConfig,
        opcionesPago: pricing.plans,
        pricingModo: pricing.modo,
        precioPreventaActivo: pricing.precioPreventaActivo,
        preventaTierIndex: pricing.preventaTierIndex,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'No se pudo obtener el curso' },
      { status: 500 }
    );
  }
}
