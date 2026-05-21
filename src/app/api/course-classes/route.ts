import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../config/connectDB';
import CourseClass from '../../../models/courseClassModel';
import Users from '../../../models/userModel';

export const dynamic = 'force-dynamic';

function getAuthUserId(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const token = cookieStore.get('userToken')?.value;
  if (!token) return null;
  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as {
      userId?: string;
      _id?: string;
      id?: string;
    };
    return decoded?.userId || decoded?._id || decoded?.id || null;
  } catch {
    return null;
  }
}

/** GET ?productId=…&timelineIndex=… */
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const timelineIndex = searchParams.get('timelineIndex');

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'productId válido requerido' }, { status: 400 });
    }

    const query: Record<string, unknown> = {
      productId: new mongoose.Types.ObjectId(productId),
    };
    if (timelineIndex != null && timelineIndex !== '') {
      query.timelineIndex = Number(timelineIndex);
    }

    const list = await CourseClass.find(query)
      .sort({ timelineIndex: 1, order: 1, createdAt: 1 })
      .lean();

    return NextResponse.json(list, { status: 200 });
  } catch (error) {
    console.error('[course-classes GET]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al listar clases del curso' },
      { status: 500 }
    );
  }
}

/** POST — solo admin */
export async function POST(req: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const userId = getAuthUserId(cookieStore);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const user = await Users.findById(userId).select('rol').lean();
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
    }

    const body = await req.json();
    const productId = body?.productId;
    const timelineIndex = Number(body?.timelineIndex);
    const name = String(body?.name || '').trim();

    if (!productId || !mongoose.Types.ObjectId.isValid(productId) || !name) {
      return NextResponse.json(
        { error: 'productId y name son requeridos' },
        { status: 400 }
      );
    }

    const doc = await CourseClass.create({
      productId: new mongoose.Types.ObjectId(productId),
      timelineIndex: Number.isNaN(timelineIndex) ? 0 : timelineIndex,
      name,
      description: body?.description ?? '',
      videoUrl: body?.videoUrl ?? '',
      videoId: body?.videoId,
      videoThumbnail: body?.videoThumbnail ?? '',
      duration: Number(body?.duration) || 0,
      level: Math.min(10, Math.max(1, Number(body?.level) || 1)),
      order: Number(body?.order) || 0,
      materials: Array.isArray(body?.materials) ? body.materials : [],
      visibleInLibrary:
        typeof body?.visibleInLibrary === 'boolean' ? body.visibleInLibrary : true,
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error('[course-classes POST]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear clase' },
      { status: 500 }
    );
  }
}
