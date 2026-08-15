import { NextResponse } from 'next/server';
import validator from 'validator';
import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import { subscribeFreeSequentialLead } from '../../../../lib/subscribeFreeSequentialLead';

export const dynamic = 'force-dynamic';

/**
 * Captura de leads para clases_gratuitas_secuenciales (ManyChat -> Instagram).
 * Solo suscribe a Mailchimp — no crea usuario del sitio. La automatización de
 * Mailchimp es la que le manda el link a la clase; la cuenta se crea recién
 * cuando la persona entra al link y se registra ahí mismo (sin verificación
 * de mail), vía el modal de registro estándar del sitio.
 */
const mask = (v: string | null) =>
  v ? `${v.slice(0, 10)}...${v.slice(-6)} (len ${v.length})` : 'null';

export async function POST(request: Request) {
  try {
    const expectedSecret = process.env.MANYCHAT_WEBHOOK_SECRET || null;
    const authHeader = request.headers.get('authorization');
    const match = !!expectedSecret && authHeader === `Bearer ${expectedSecret}`;

    // DEBUG TEMPORAL — sacar una vez resuelto el 401 de ManyChat.
    console.log('[free-sequential subscribe] DEBUG auth', {
      expectedSecret: mask(expectedSecret),
      authHeaderReceived: mask(authHeader),
      match,
    });

    if (!match) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    console.log('[free-sequential subscribe] DEBUG body', body);
    const email = String(body?.email || '').trim().toLowerCase();
    const name = String(body?.name || '').trim();
    const slug = String(body?.slug || '').trim().toLowerCase();

    if (!email || !validator.isEmail(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    if (!slug) {
      return NextResponse.json({ error: 'slug requerido' }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findOne({
      tipo: 'clases_gratuitas_secuenciales',
      'secuenciaConfig.slug': slug,
      activo: true,
    })
      .select('_id secuenciaConfig.publicado')
      .lean();

    if (!product || product.secuenciaConfig?.publicado === false) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    await subscribeFreeSequentialLead({ email, name });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('[free-sequential subscribe] error', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
