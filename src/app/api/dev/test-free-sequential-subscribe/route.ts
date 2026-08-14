import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Users from '../../../../models/userModel';
import Product from '../../../../models/productModel';
import { subscribeFreeSequentialLead } from '../../../../lib/subscribeFreeSequentialLead';

/**
 * Prueba manual del funnel de ManyChat: genera un email random, lo suscribe
 * a Mailchimp igual que /api/free-sequential/subscribe, y confirma que NO
 * haya quedado ningún User creado en Mongo con ese email.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const slug = String(body?.slug || '').trim().toLowerCase();
    if (!slug) {
      return NextResponse.json({ error: 'Falta slug' }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findOne({
      tipo: 'clases_gratuitas_secuenciales',
      'secuenciaConfig.slug': slug,
      activo: true,
    })
      .select('_id')
      .lean();
    if (!product) {
      return NextResponse.json(
        { error: `No existe producto activo con slug "${slug}"` },
        { status: 404 }
      );
    }

    const email =
      String(body?.email || '').trim().toLowerCase() ||
      `amolfinoarrua+clasesgratis${Date.now()}@gmail.com`;
    const name = 'Test Lead';

    const member: any = await subscribeFreeSequentialLead({ email, name });

    const existingUser = await Users.findOne({ email }).select('_id').lean();

    return NextResponse.json({
      ok: true,
      email,
      slug,
      mailchimp: member
        ? {
            status: member.status,
            tags: (member.tags || []).map((t: any) => t.name),
          }
        : 'MAILCHIMP_RUTINAS_AUDIENCE_ID no configurado — no se llamó a Mailchimp',
      userCreated: !!existingUser,
    });
  } catch (error: any) {
    console.error('[dev/test-free-sequential-subscribe]', error);
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 });
  }
}
