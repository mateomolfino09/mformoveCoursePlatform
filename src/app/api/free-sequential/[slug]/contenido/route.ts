import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '../../../../../config/connectDB';
import Product from '../../../../../models/productModel';
import CourseClass from '../../../../../models/courseClassModel';
import CourseClassProgress from '../../../../../models/courseClassProgressModel';
import Users from '../../../../../models/userModel';
import {
  ensureProductAccess,
  isClassRevealedInList,
  type SessionUser,
} from '../../../../../lib/freeSequentialAccess';
import { resolveFreeSequentialCta } from '../../../../../lib/freeSequentialCta';
import { resolveCourseClassThumbnailUrl } from '../../../../../lib/resolveMediaImageUrl';

export const dynamic = 'force-dynamic';

type ClassThumbnailSource = {
  videoThumbnail?: string;
  videoId?: string;
  videoUrl?: string;
};

/**
 * En las clases bloqueadas no se cae al id de Vimeo: la URL del proxy lo dejaría
 * a la vista y estos videos son `unlisted`, sin más protección que su id.
 */
function classThumbnail(cls: ClassThumbnailSource, unlocked: boolean): string {
  if (!unlocked) return cls.videoThumbnail || '';
  return resolveCourseClassThumbnailUrl(cls);
}

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

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const slug = params.slug?.trim().toLowerCase();
    if (!slug) {
      return NextResponse.json({ error: 'Slug requerido' }, { status: 400 });
    }

    const user = await getSessionUser();
    const isAdmin = user?.rol === 'Admin';

    const product = await Product.findOne({
      tipo: 'clases_gratuitas_secuenciales',
      'secuenciaConfig.slug': slug,
      activo: true,
    }).lean();

    if (!product || (product.secuenciaConfig?.publicado === false && !isAdmin)) {
      return NextResponse.json({ error: 'Contenido no encontrado' }, { status: 404 });
    }

    const cta = await resolveFreeSequentialCta(product.secuenciaConfig);

    const classes = await CourseClass.find({ productId: product._id })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    // Guest: listado visible sin videos ni progreso; el front fuerza login.
    if (!user) {
      const clases = classes.map((cls, idx) => ({
        _id: cls._id,
        order: cls.order,
        name: cls.name,
        description: cls.description,
        videoThumbnail: classThumbnail(cls, idx === 0),
        duration: cls.duration,
        unlocked: idx === 0,
        status: 'not_started' as const,
      }));

      return NextResponse.json(
        {
          productId: String(product._id),
          slug,
          nombre: product.nombre,
          descripcion: product.descripcion,
          clases,
          requiresAuth: true,
          cta,
        },
        { status: 200, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const userId = String((user as { _id: unknown })._id);
    await ensureProductAccess(userId, String(product._id));

    const progressDocs = await CourseClassProgress.find({
      userId,
      productId: product._id,
    })
      .select('courseClassId status')
      .lean();

    const progressByClassId = new Map(
      progressDocs.map((p) => [String(p.courseClassId), p.status as string])
    );

    const clases = classes.map((cls, idx) => {
      const progressStatus = progressByClassId.get(String(cls._id));
      const hasOwnProgress = !!progressStatus;
      const unlocked = isClassRevealedInList({
        isFirst: idx === 0,
        hasOwnProgress,
      });

      const base = {
        _id: cls._id,
        order: cls.order,
        name: cls.name,
        description: cls.description,
        videoThumbnail: classThumbnail(cls, unlocked),
        duration: cls.duration,
        unlocked,
        status: progressStatus || 'not_started',
      };

      if (!unlocked) {
        return base;
      }

      return {
        ...base,
        materials: cls.materials,
        videoUrl: cls.videoUrl,
        videoId: cls.videoId,
        pdfUrl: cls.pdfUrl,
      };
    });

    return NextResponse.json(
      {
        productId: String(product._id),
        slug,
        nombre: product.nombre,
        descripcion: product.descripcion,
        clases,
        requiresAuth: false,
        cta,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[free-sequential contenido]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
