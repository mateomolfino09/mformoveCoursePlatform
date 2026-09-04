import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import Users from '../../../../models/userModel';
import { ensureCursoSuscripcionPaymentLinks } from '../../../../lib/ensureCursoSuscripcionPaymentLinks';
import {
  CURSO_SUSCRIPCION_INTERVALO_4_MESES,
  CURSO_SUSCRIPCION_INTERVALO_MENSUAL,
  resolveCursoPlanIntervaloMeses,
} from '../../../../lib/cursoSuscripcion';
import { normalizeCursoLandingConfig } from '../../../../types/cursoLanding';

connectDB();

/**
 * Regenera los dos Payment Links de Stripe (mensual + cada 4 meses) de un curso
 * por suscripción, sin pasar por el PUT completo de updateProduct.
 *
 * POST { userEmail, productId?, slug? }
 * Si no se pasa productId ni slug, busca Cuerpo Autónomo.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userEmail =
      typeof body?.userEmail === 'string' ? body.userEmail.trim() : '';
    const productId =
      typeof body?.productId === 'string' ? body.productId.trim() : '';
    const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail es requerido' }, { status: 400 });
    }

    const user = await Users.findOne({ email: userEmail });
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json(
        { error: 'Este usuario no tiene permisos para regenerar links de pago' },
        { status: 422 }
      );
    }

    const product = productId
      ? await Product.findById(productId)
      : slug
        ? await Product.findOne({ tipo: 'curso', 'cursoConfig.slug': slug })
        : await Product.findOne({
            tipo: 'curso',
            $or: [
              { 'cursoConfig.slug': { $regex: /cuerpo.?autonomo/i } },
              { nombre: { $regex: /cuerpo.?aut[oó]nomo/i } },
            ],
          });

    if (!product) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    if (product.tipo !== 'curso') {
      return NextResponse.json(
        { error: 'El producto no es un curso' },
        { status: 400 }
      );
    }

    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      new URL(req.url).origin;

    const nombre = product.nombre || product.name || 'Curso';
    // Leer cursoConfig también por el driver nativo: la lectura de Mongoose de este campo
    // puede quedar stale en este proceso, igual que su escritura (ver más abajo).
    const rawProduct = await require('mongoose')
      .connection.db.collection('products')
      .findOne({ _id: product._id }, { projection: { cursoConfig: 1 } });
    const cursoConfig = normalizeCursoLandingConfig(rawProduct?.cursoConfig ?? product.cursoConfig, nombre);

    const withLinks = await ensureCursoSuscripcionPaymentLinks(
      {
        _id: product._id.toString(),
        nombre,
        descripcion: product.descripcion || product.description,
        precio: product.precio,
        moneda: product.moneda,
        portada: product.portada,
        esSuscripcion: true,
        cursoConfig,
      },
      origin
    );

    if (!withLinks) {
      return NextResponse.json(
        { error: 'No se pudo regenerar el cursoConfig' },
        { status: 500 }
      );
    }

    const opciones = withLinks.planes?.opcionesPago || [];
    const stripeOpciones = opciones.filter(
      (opcion) => opcion.proveedor === 'stripe' && Boolean(opcion.paymentLink?.trim())
    );
    const hasMonthly = stripeOpciones.some(
      (opcion) =>
        resolveCursoPlanIntervaloMeses(opcion) === CURSO_SUSCRIPCION_INTERVALO_MENSUAL
    );
    const has4Meses = stripeOpciones.some(
      (opcion) =>
        resolveCursoPlanIntervaloMeses(opcion) === CURSO_SUSCRIPCION_INTERVALO_4_MESES
    );

    if (!hasMonthly || !has4Meses) {
      return NextResponse.json(
        {
          error:
            'Stripe no devolvió los dos Payment Links (mensual + 4 meses). Revisá STRIPE_SECRET_KEY, el precio del producto y los logs del servidor.',
          opcionesPago: stripeOpciones,
        },
        { status: 502 }
      );
    }

    const monthly = stripeOpciones.find(
      (opcion) =>
        resolveCursoPlanIntervaloMeses(opcion) === CURSO_SUSCRIPCION_INTERVALO_MENSUAL
    );

    // Mongoose (tanto document.save() como Model.updateOne()) no persiste de forma confiable
    // este campo anidado en este endpoint — probado exhaustivamente. El driver nativo de
    // MongoDB (mongoose.connection.db), sin la capa de casting de Mongoose, sí funciona siempre.
    const nativeCollection = require('mongoose').connection.db.collection('products');
    await nativeCollection.updateOne(
      { _id: product._id },
      {
        $set: {
          esSuscripcion: true,
          cursoConfig: withLinks,
          ...(monthly?.stripeProductId ? { stripeProductId: monthly.stripeProductId } : {}),
        },
      }
    );

    return NextResponse.json({
      message: 'Payment Links de suscripción regenerados',
      product: {
        id: product._id,
        nombre,
        slug: withLinks.slug,
        esSuscripcion: true,
        precio: product.precio,
        moneda: product.moneda,
      },
      opcionesPago: stripeOpciones.map((opcion) => ({
        etiqueta: opcion.etiqueta,
        intervaloMeses: resolveCursoPlanIntervaloMeses(opcion),
        monto: opcion.monto,
        moneda: opcion.moneda,
        paymentLink: opcion.paymentLink,
        stripePriceId: opcion.stripePriceId,
        stripeProductId: opcion.stripeProductId,
      })),
    });
  } catch (error) {
    console.error('Error regenerando links de suscripción:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Error al procesar la solicitud',
      },
      { status: 500 }
    );
  }
}
