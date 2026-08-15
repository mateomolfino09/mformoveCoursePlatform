import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Users from '../../../../models/userModel';
import { resolveCuerpoAutonomoProductId } from '../../../../lib/userHasCuerpoAutonomo';

/**
 * SOLO LOCAL — bloqueado en producción a propósito (ver guard abajo).
 * Da acceso gratuito al curso Cuerpo Autónomo a un usuario ya existente,
 * igual que a alguien que lo pagó (misma forma de entrada en
 * cursosAdquiridos que arma fulfillCoursePurchase, pero sin transacción real
 * ni mail de bienvenida — mismo criterio que grantAnnualMentorshipProductGifts).
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    return NextResponse.json({ error: 'No disponible en producción' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email || '').trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'Falta email' }, { status: 400 });
    }

    await connectDB();

    const productId = await resolveCuerpoAutonomoProductId();
    if (!productId) {
      return NextResponse.json(
        { error: 'No existe el producto de curso Cuerpo Autónomo' },
        { status: 404 }
      );
    }

    const user = await Users.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: `No existe un usuario con el email "${email}"` },
        { status: 404 }
      );
    }

    const alreadyHasAccess = (user.cursosAdquiridos || []).some(
      (entry: any) => entry?.productoId?.toString() === productId
    );
    if (alreadyHasAccess) {
      return NextResponse.json({ ok: true, alreadyHadAccess: true, userId: user._id.toString() });
    }

    user.cursosAdquiridos = user.cursosAdquiridos || [];
    user.cursosAdquiridos.push({
      productoId: productId,
      fechaCompra: new Date(),
      metodoPago: 'gratis',
      transaccionId: `dev-grant-cuerpo-autonomo:${Date.now()}`,
      monto: 0,
      moneda: 'USD',
      bienvenidaPendiente: false,
    });
    await user.save();

    return NextResponse.json({ ok: true, alreadyHadAccess: false, userId: user._id.toString() });
  } catch (error: any) {
    console.error('[dev/grant-cuerpo-autonomo]', error);
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 });
  }
}
