import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Users from '../../../../models/userModel';
import { resolveCuerpoAutonomoProductId } from '../../../../lib/userHasCuerpoAutonomo';

/**
 * SOLO LOCAL — bloqueado en producción a propósito (ver guard abajo).
 * Da acceso gratuito al curso Cuerpo Autónomo a uno o varios usuarios ya
 * existentes, igual que a alguien que lo pagó (misma forma de entrada en
 * cursosAdquiridos que arma fulfillCoursePurchase, pero sin transacción real
 * ni mail de bienvenida — mismo criterio que grantAnnualMentorshipProductGifts).
 *
 * Body acepta { email: string } o { emails: string[] }. Un email que no
 * corresponde a ningún usuario no aborta el resto del lote: se reporta en
 * `notFound` y la respuesta sigue siendo 200.
 */
async function grantToEmail(email: string, productId: string) {
  const user = await Users.findOne({ email });
  if (!user) {
    return { email, found: false as const };
  }

  const alreadyHasAccess = (user.cursosAdquiridos || []).some(
    (entry: any) => entry?.productoId?.toString() === productId
  );
  if (alreadyHasAccess) {
    return { email, found: true as const, alreadyHadAccess: true, userId: user._id.toString() };
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

  return { email, found: true as const, alreadyHadAccess: false, userId: user._id.toString() };
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    return NextResponse.json({ error: 'No disponible en producción' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => null);
    const rawEmails = Array.isArray(body?.emails) ? body.emails : [body?.email];
    const emails = Array.from(
      new Set(
        rawEmails
          .map((e: unknown) => String(e || '').trim().toLowerCase())
          .filter((e: string) => e.length > 0)
      )
    ) as string[];

    if (emails.length === 0) {
      return NextResponse.json({ error: 'Falta email o emails' }, { status: 400 });
    }

    await connectDB();

    const productId = await resolveCuerpoAutonomoProductId();
    if (!productId) {
      return NextResponse.json(
        { error: 'No existe el producto de curso Cuerpo Autónomo' },
        { status: 404 }
      );
    }

    const results = await Promise.all(emails.map((email) => grantToEmail(email, productId)));

    const granted = results.filter((r) => r.found && !r.alreadyHadAccess);
    const alreadyHadAccess = results.filter((r) => r.found && r.alreadyHadAccess);
    const notFound = results.filter((r) => !r.found).map((r) => r.email);

    return NextResponse.json({
      ok: true,
      summary: {
        requested: emails.length,
        granted: granted.length,
        alreadyHadAccess: alreadyHadAccess.length,
        notFound: notFound.length,
      },
      granted: granted.map((r) => ({ email: r.email, userId: r.userId })),
      alreadyHadAccessList: alreadyHadAccess.map((r) => ({ email: r.email, userId: r.userId })),
      notFound,
    });
  } catch (error: any) {
    console.error('[dev/grant-cuerpo-autonomo]', error);
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 });
  }
}
