import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '../../../../../config/connectDB';
import Product from '../../../../../models/productModel';
import CourseClass from '../../../../../models/courseClassModel';
import Users from '../../../../../models/userModel';
import {
  canUserAccessCursoContenido,
  cursoContenidoBlockedMessage,
} from '../../../../../lib/courseAccess';
import {
  isCursoContenidoDisponible,
  parseCursoPublicationDate,
} from '../../../../../lib/cursoLandingPublication';
import { normalizeCursoLandingConfig } from '../../../../../types/cursoLanding';
import { resolveInvitacionGrupoWhatsappFromProduct } from '../../../../../lib/resolveInvitacionGrupoWhatsapp';
import { formatTitleCaseWords } from '../../../../../lib/formatDisplayTitle';

export const dynamic = 'force-dynamic';

async function getSessionUser() {
  const token = cookies().get('userToken')?.value;
  if (!token) return null;
  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET as string) as {
      userId?: string;
      _id?: string;
    };
    const userId = decoded?.userId || decoded?._id;
    if (!userId) return null;
    return Users.findById(userId).select('rol cursosAdquiridos').lean();
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

    const product = await Product.findOne({
      tipo: 'curso',
      'cursoConfig.slug': slug,
    }).lean();

    if (!product) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    const user = await getSessionUser();
    const cursoConfig = normalizeCursoLandingConfig(
      product.cursoConfig,
      product.nombre || 'Curso'
    );
    const productId = String(product._id);
    const launchDate = parseCursoPublicationDate(cursoConfig.fechaPublicacion);
    const contenidoDisponible = isCursoContenidoDisponible(cursoConfig);

    const access = canUserAccessCursoContenido(user, productId, cursoConfig);

    if (!access.ok) {
      return NextResponse.json(
        {
          error: cursoContenidoBlockedMessage(access.reason, launchDate),
          reason: access.reason,
          slug,
          nombre: formatTitleCaseWords(product.nombre),
          contenidoDisponible,
          fechaLanzamiento: launchDate?.toISOString() ?? null,
        },
        { status: access.reason === 'no_auth' ? 401 : 403 }
      );
    }

    const courseClasses = await CourseClass.find({
      productId: product._id,
      visibleInLibrary: { $ne: false },
    })
      .sort({ timelineIndex: 1, order: 1, createdAt: 1 })
      .lean();

    const classesByModule = new Map<number, typeof courseClasses>();
    for (const cls of courseClasses) {
      const idx = Number(cls.timelineIndex) || 0;
      if (!classesByModule.has(idx)) classesByModule.set(idx, []);
      classesByModule.get(idx)!.push(cls);
    }

    const modulos = (cursoConfig.contenidoModulos || []).map((mod) => {
      const dbClasses = classesByModule.get(mod.timelineIndex) || [];
      const embedded = mod.clases || [];
      const merged =
        dbClasses.length > 0
          ? dbClasses
          : embedded
              .filter((c) => c.courseClassId)
              .map((c) => ({
                _id: c.courseClassId,
                name: c.name,
                description: c.description,
                videoUrl: c.videoUrl,
                videoId: c.videoId,
                videoThumbnail: c.videoThumbnail,
                duration: c.duration,
                level: c.level,
                order: c.order,
                materials: c.materials,
                timelineIndex: mod.timelineIndex,
              }));

      return {
        timelineIndex: mod.timelineIndex,
        titulo: mod.titulo,
        bundleTipo: mod.bundleTipo,
        vimeoPlaylistId: mod.vimeoPlaylistId,
        clases: merged,
      };
    });

    return NextResponse.json(
      {
        productId,
        slug,
        nombre: formatTitleCaseWords(product.nombre),
        contenidoDisponible,
        fechaLanzamiento: launchDate?.toISOString() ?? null,
        invitacionGrupoWhatsapp: resolveInvitacionGrupoWhatsappFromProduct(product) || null,
        modulos,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[curso contenido]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
