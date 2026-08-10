import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../../config/connectDB';
import CourseClass from '../../../../../models/courseClassModel';
import CourseClassProgress from '../../../../../models/courseClassProgressModel';
import Product from '../../../../../models/productModel';
import Users from '../../../../../models/userModel';
import {
  ensureProductAccess,
  isClassUnlocked,
  freeSequentialBlockedMessage,
  type SessionUser,
} from '../../../../../lib/freeSequentialAccess';
import { resolveFreeSequentialCta } from '../../../../../lib/freeSequentialCta';

export const dynamic = 'force-dynamic';

async function getSessionUser(): Promise<SessionUser> {
  const token = cookies().get('userToken')?.value;
  if (!token) return null;
  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET as string) as {
      userId?: string;
      _id?: string;
    };
    const userId = decoded?.userId || decoded?._id;
    if (!userId) return null;
    await connectDB();
    return Users.findById(userId).select('rol').lean();
  } catch {
    return null;
  }
}

function publicPreviewPayload(
  doc: Record<string, unknown>,
  cta: Awaited<ReturnType<typeof resolveFreeSequentialCta>>
) {
  return {
    _id: doc._id,
    name: doc.name,
    description: doc.description,
    descripcionGeneral: doc.descripcionGeneral,
    descripcionCorta: doc.descripcionCorta,
    descripcionCompleta: doc.descripcionCompleta,
    videoThumbnail: doc.videoThumbnail,
    duration: doc.duration,
    materials: doc.materials,
    order: doc.order,
    // Preview con video: el front deja reproducir unos segundos y después fuerza login.
    videoUrl: doc.videoUrl,
    videoId: doc.videoId,
    previousClassId: null,
    nextClassId: null,
    nextUnlocked: false,
    requiresAuth: true,
    cta,
  };
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
    const isAdmin = user?.rol === 'Admin';

    const product = await Product.findById(doc.productId).lean();
    if (
      !product ||
      product.tipo !== 'clases_gratuitas_secuenciales' ||
      (product.secuenciaConfig?.publicado === false && !isAdmin)
    ) {
      return NextResponse.json({ error: 'Contenido no encontrado' }, { status: 404 });
    }

    const cta = await resolveFreeSequentialCta(product.secuenciaConfig);

    // Guest: preview de marketing (sin progreso, sin video) → el front fuerza login.
    if (!user) {
      return NextResponse.json(publicPreviewPayload(doc as Record<string, unknown>, cta), {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const userId = String((user as { _id: unknown })._id);
    const productId = String(product._id);
    await ensureProductAccess(userId, productId);

    const unlocked = await isClassUnlocked(userId, productId, doc.order);
    if (!unlocked) {
      return NextResponse.json(
        { error: freeSequentialBlockedMessage('locked'), reason: 'locked', cta },
        { status: 403 }
      );
    }

    try {
      await CourseClassProgress.findOneAndUpdate(
        { userId, courseClassId: doc._id },
        { $setOnInsert: { productId: product._id, status: 'started', startedAt: new Date() } },
        { upsert: true, new: true }
      );
    } catch (progressError) {
      const isDuplicateKeyError =
        (progressError as { code?: number })?.code === 11000;
      if (!isDuplicateKeyError) throw progressError;
    }

    const [previousClass, nextClass] = await Promise.all([
      CourseClass.findOne({ productId: product._id, order: { $lt: doc.order } })
        .sort({ order: -1 })
        .select('_id')
        .lean(),
      CourseClass.findOne({ productId: product._id, order: { $gt: doc.order } })
        .sort({ order: 1 })
        .select('_id order')
        .lean(),
    ]);

    let nextUnlocked = false;
    if (nextClass) {
      const nextProgress = await CourseClassProgress.findOne({
        userId,
        courseClassId: nextClass._id,
      })
        .select('_id')
        .lean();
      nextUnlocked = !!nextProgress;
    }

    return NextResponse.json(
      {
        ...doc,
        previousClassId: previousClass ? String(previousClass._id) : null,
        nextClassId: nextClass ? String(nextClass._id) : null,
        nextUnlocked,
        requiresAuth: false,
        cta,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[free-sequential class detail]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
