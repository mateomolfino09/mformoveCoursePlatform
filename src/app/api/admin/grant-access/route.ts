import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../config/connectDB';
import Users from '../../../../models/userModel';
import { grantCourseAccessToEmail } from '../../../../lib/grantCourseAccess';
import { listGrantableProducts } from '../../../../lib/grantableProducts';
import { userHasPurchasedCourse } from '../../../../lib/courseAccess';

export const dynamic = 'force-dynamic';

const MAX_MONTHS = 36;

async function requireAdmin(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('userToken')?.value;
  if (!token) return null;
  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as {
      userId?: string;
      _id?: string;
      id?: string;
    };
    const userId = decoded?.userId || decoded?._id || decoded?.id;
    if (!userId) return null;
    const user = await Users.findById(userId).select('rol').lean();
    if (!user || user.rol !== 'Admin') return null;
    return String(userId);
  } catch {
    return null;
  }
}

function isEntryVigente(
  entry: { status?: string; expiresAt?: Date | string | null },
  now: Date
): boolean {
  const status = entry.status ?? 'active';
  if (status !== 'active') return false;
  if (!entry.expiresAt) return true;
  return new Date(entry.expiresAt).getTime() > now.getTime();
}

/** GET: lista cursos otorgables. Con ?email= también devuelve el usuario y su acceso vigente. */
export async function GET(req: Request) {
  try {
    await connectDB();
    const adminId = await requireAdmin();
    if (!adminId) {
      return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
    }

    const products = await listGrantableProducts();
    const { searchParams } = new URL(req.url);
    const email = String(searchParams.get('email') || '')
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json({ products });
    }

    const user = await Users.findOne({ email }).select(
      '_id name email cursosAdquiridos'
    ).lean();

    if (!user) {
      return NextResponse.json({
        products,
        user: null,
        access: [],
      });
    }

    const now = new Date();
    const access = products.map((product) => {
      const entries = ((user as any).cursosAdquiridos || []).filter(
        (entry: any) => entry?.productoId?.toString() === product.id
      );
      const vigente = userHasPurchasedCourse(user as any, product.id);
      const latest = entries[entries.length - 1];
      return {
        productId: product.id,
        vigente,
        status: latest?.status ?? null,
        expiresAt: latest?.expiresAt ?? null,
        source: latest?.source ?? null,
        isLatestVigente: latest ? isEntryVigente(latest, now) : false,
      };
    });

    return NextResponse.json({
      products,
      user: {
        id: String((user as any)._id),
        name: (user as any).name || '',
        email: (user as any).email,
      },
      access,
    });
  } catch (error) {
    console.error('[admin/grant-access GET]', error);
    return NextResponse.json({ error: 'Error al cargar accesos' }, { status: 500 });
  }
}

/** POST: otorga acceso a un curso (usuario ya registrado). */
export async function POST(req: Request) {
  try {
    await connectDB();
    const adminId = await requireAdmin();
    if (!adminId) {
      return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const email = String(body?.email || '')
      .trim()
      .toLowerCase();
    const productId = String(body?.productId || '').trim();
    const metodoPago =
      body?.metodoPago === 'gratis' ? 'gratis' : 'transferencia';
    const sendWelcomeEmail = body?.sendWelcomeEmail !== false;

    let months: number | null = null;
    if (body?.months !== undefined && body?.months !== null && body?.months !== '') {
      const parsed = Number(body.months);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > MAX_MONTHS) {
        return NextResponse.json(
          { error: `Duración inválida (0–${MAX_MONTHS} meses)` },
          { status: 400 }
        );
      }
      months = parsed === 0 ? null : Math.floor(parsed);
    }

    if (!email || !productId) {
      return NextResponse.json(
        { error: 'Email y curso son requeridos' },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Curso inválido' }, { status: 400 });
    }

    const result = await grantCourseAccessToEmail({
      email,
      productId,
      months,
      metodoPago,
      sendWelcomeEmail,
      grantedByAdminId: adminId,
    });

    if (!result.ok) {
      if (result.code === 'user_not_found') {
        return NextResponse.json(
          { error: 'No existe un usuario registrado con ese email. Tiene que crear la cuenta antes.' },
          { status: 404 }
        );
      }
      if (result.code === 'product_not_found') {
        return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Ese curso no se puede otorgar desde esta sección' },
        { status: 403 }
      );
    }

    if (result.alreadyHadAccess) {
      return NextResponse.json({
        ok: true,
        alreadyHadAccess: true,
        message: `${result.email} ya tiene acceso vigente a ${result.productName}.`,
        userId: result.userId,
        productId: result.productId,
      });
    }

    return NextResponse.json({
      ok: true,
      alreadyHadAccess: false,
      message: `Acceso a ${result.productName} otorgado a ${result.email}.`,
      userId: result.userId,
      productId: result.productId,
      emailSent: result.emailSent,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error('[admin/grant-access POST]', error);
    return NextResponse.json({ error: 'Error al otorgar acceso' }, { status: 500 });
  }
}
