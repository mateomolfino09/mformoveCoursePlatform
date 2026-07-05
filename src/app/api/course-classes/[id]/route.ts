import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../config/connectDB';
import CourseClass from '../../../../models/courseClassModel';
import Product from '../../../../models/productModel';
import Users from '../../../../models/userModel';
import {
  canUserAccessCursoContenido,
  cursoContenidoBlockedMessage,
} from '../../../../lib/courseAccess';
import { parseCursoPublicationDate } from '../../../../lib/cursoLandingPublication';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
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
    return userId;
  } catch {
    return null;
  }
}

async function getSessionUser() {
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
    await connectDB();
    return Users.findById(userId).select('rol cursosAdquiridos').lean();
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    const doc = await CourseClass.findById(params.id).lean();
    if (!doc) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 });
    }

    const user = await getSessionUser();
    const product = await Product.findById(doc.productId)
      .select('tipo cursoConfig.publicado cursoConfig.fechaPublicacion')
      .lean();

    if (!product || product.tipo !== 'curso') {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    const access = canUserAccessCursoContenido(
      user,
      String(doc.productId),
      product.cursoConfig as { publicado?: boolean; fechaPublicacion?: string | null }
    );

    if (!access.ok) {
      const launch = parseCursoPublicationDate(product.cursoConfig?.fechaPublicacion);
      return NextResponse.json(
        {
          error: cursoContenidoBlockedMessage(access.reason, launch),
          reason: access.reason,
        },
        { status: access.reason === 'no_auth' ? 401 : 403 }
      );
    }

    return NextResponse.json(doc, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const update: Record<string, unknown> = {};
    const fields = [
      'name',
      'description',
      'descripcionGeneral',
      'descripcionCorta',
      'descripcionCompleta',
      'pdfUrl',
      'videoUrl',
      'videoId',
      'videoThumbnail',
      'duration',
      'level',
      'order',
      'materials',
      'visibleInLibrary',
      'timelineIndex',
    ] as const;

    for (const key of fields) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    if (update.level != null) {
      update.level = Math.min(10, Math.max(1, Number(update.level) || 1));
    }

    const doc = await CourseClass.findByIdAndUpdate(params.id, update, { new: true }).lean();
    if (!doc) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 });
    }
    return NextResponse.json(doc, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    await CourseClass.findByIdAndDelete(params.id);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar' },
      { status: 500 }
    );
  }
}
