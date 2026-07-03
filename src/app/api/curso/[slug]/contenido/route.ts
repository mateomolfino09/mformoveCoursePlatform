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
  isCursoContenidoDisponible,
} from '../../../../../lib/courseAccess';
import { parseCursoPublicationDate } from '../../../../../lib/cursoLandingPublication';
import { normalizeCursoLandingConfig } from '../../../../../types/cursoLanding';
import { resolveInvitacionGrupoWhatsappFromProduct } from '../../../../../lib/resolveInvitacionGrupoWhatsapp';
import { formatTitleCaseWords } from '../../../../../lib/formatDisplayTitle';
import {
  joinAboutDescriptionLines,
  resolveCursoAboutDescriptionLines,
} from '../../../../../lib/cursoAboutDescription';
import MoveCrewEvent from '../../../../../models/moveCrewEventModel';
import { resolveNextMoveCrewEventOccurrence } from '../../../../../lib/resolveNextMoveCrewEvent';
import { routes } from '../../../../../constants/routes';

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
                descripcionGeneral: c.descripcionGeneral,
                descripcionCorta: c.descripcionCorta,
                descripcionCompleta: c.descripcionCompleta,
                pdfUrl: c.pdfUrl,
                videoUrl: c.videoUrl,
                videoId: c.videoId,
                videoThumbnail: c.videoThumbnail,
                duration: c.duration,
                level: c.level,
                order: c.order,
                materials: c.materials,
                timelineIndex: mod.timelineIndex,
              }));

      const highlight = cursoConfig.highlights.items[mod.timelineIndex];
      const landingModulo = cursoConfig.queIncluye.modulos[mod.timelineIndex];

      return {
        timelineIndex: mod.timelineIndex,
        titulo: mod.titulo,
        esencia: mod.esencia?.trim() || '',
        descripcion: highlight?.resumen || highlight?.detalle || landingModulo?.descripcion || '',
        imagenPublicId:
          highlight?.imagenPublicId?.trim() ||
          landingModulo?.imagenPublicId?.trim() ||
          '',
        bundleTipo: mod.bundleTipo,
        vimeoPlaylistId: mod.vimeoPlaylistId,
        clases: merged,
      };
    });

    const practicesCount = modulos.reduce((acc, mod) => acc + mod.clases.length, 0);
    const aboutLines = resolveCursoAboutDescriptionLines(cursoConfig);
    const aboutDescription = joinAboutDescriptionLines(aboutLines);

    const moveCrewEvents = await MoveCrewEvent.find().lean();
    const proximoEncuentroRaw = resolveNextMoveCrewEventOccurrence(moveCrewEvents);
    const proximoEncuentro = proximoEncuentroRaw
      ? {
          ...proximoEncuentroRaw,
          calendarUrl: `/api/membership-events/${proximoEncuentroRaw.eventId}/calendar?date=${encodeURIComponent(proximoEncuentroRaw.fechaIso)}`,
        }
      : null;

    const invitacionGrupo = resolveInvitacionGrupoWhatsappFromProduct(product) || null;

    return NextResponse.json(
      {
        productId,
        slug,
        nombre: formatTitleCaseWords(product.nombre),
        contenidoDisponible,
        fechaLanzamiento: launchDate?.toISOString() ?? null,
        invitacionGrupoWhatsapp: invitacionGrupo,
        modulos,
        comunidad: {
          whatsappGrupo: {
            url: invitacionGrupo,
            titulo: 'Comunidad de WhatsApp',
            descripcion:
              'El lugar donde conectás con otros alumnos y con Mateo. Avisos, soporte y novedades del programa.',
            ctaTexto: 'Unirme al grupo',
          },
          proximoEncuentro,
          contactoMateo: {
            url: cursoConfig.whatsapp?.enlace?.trim() || '',
            titulo: 'Diagnóstico técnico con Mateo',
            descripcion:
              '¿Tenés una consulta específica o querés ir más profundo? Escribime directo — también es el puente hacia la mentoría.',
            ctaTexto: cursoConfig.whatsapp?.ctaTexto?.trim() || 'Escribirme por WhatsApp',
            mentoriaUrl: routes.navegation.mentoria,
          },
        },
        hub: {
          /** Mismo video que la landing del curso (CourseHero). */
          heroVideoId: cursoConfig.hero?.videoPresentacionVimeoId?.trim() || '',
          heroHeadline:
            cursoConfig.betweenHero?.titulo?.trim() ||
            cursoConfig.hero?.tagline?.trim() ||
            formatTitleCaseWords(product.nombre),
          heroEyebrow:
            cursoConfig.betweenHero?.eyebrow?.trim() ||
            formatTitleCaseWords(product.nombre),
          heroTagline: cursoConfig.hero?.tagline?.trim() || '',
          aboutDescription,
          heroThumbnailPublicId:
            cursoConfig.introHighlights?.imagenDesktopPublicId?.trim() ||
            cursoConfig.outcomes?.imagenPublicId?.trim() ||
            '',
          practicesCount,
          modulosCount: modulos.length,
        },
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
