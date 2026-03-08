import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../config/connectDB';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';
import Users from '../../../../models/userModel';
import IndividualClass from '../../../../models/individualClassModel';
import { EmailService, EmailType } from '../../../../services/email/emailService';

export const revalidate = 0;
export const fetchCache = 'force-no-store';

function extractVimeoId(urlOrId) {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = String(urlOrId).trim();
  const match = trimmed.match(/(?:vimeo\.com\/)(\d+)/);
  if (match) return match[1];
  if (/^\d+$/.test(trimmed)) return trimmed;
  return null;
}

function toVimeoUrl(link) {
  if (!link || !String(link).trim()) return '';
  const s = String(link).trim();
  if (s.startsWith('http')) return s;
  return `https://vimeo.com/${s}`;
}

/**
 * Reemplaza un contenido de tipo zoomEvent por una clase individual (grabación del evento).
 * Se mantiene la posición y la publicación: la clase se agrega solo al camino y se publica
 * según el cron (última semana = jueves del mes).
 */
export async function POST(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const userToken = cookieStore.get('userToken')?.value;
    if (!userToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verify(userToken, process.env.NEXTAUTH_SECRET);
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const userId = decoded.userId || decoded._id || decoded.id;
    if (!userId) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const user = await Users.findById(userId).lean();
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'Solo administradores pueden realizar esta acción' }, { status: 403 });
    }

    const body = await req.json();
    const { logbookId, weekIndex, contentIndex, individualClassId } = body;

    if (!logbookId || weekIndex == null || contentIndex == null || !individualClassId) {
      return NextResponse.json(
        { error: 'Faltan logbookId, weekIndex, contentIndex o individualClassId' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(logbookId) || !mongoose.Types.ObjectId.isValid(individualClassId)) {
      return NextResponse.json({ error: 'IDs inválidos' }, { status: 400 });
    }

    const logbook = await WeeklyLogbook.findById(logbookId);
    if (!logbook) {
      return NextResponse.json({ error: 'Camino no encontrada' }, { status: 404 });
    }

    const weeklyContents = logbook.weeklyContents || [];
    if (weekIndex < 0 || weekIndex >= weeklyContents.length) {
      return NextResponse.json({ error: 'Índice de semana inválido' }, { status: 400 });
    }

    const contents = weeklyContents[weekIndex].contents || [];
    if (contentIndex < 0 || contentIndex >= contents.length) {
      return NextResponse.json({ error: 'Índice de contenido inválido' }, { status: 400 });
    }

    const item = contents[contentIndex];
    if ((item.contentType || '') !== 'zoomEvent') {
      return NextResponse.json(
        { error: 'El contenido seleccionado no es un evento (clase en vivo). Solo se puede reemplazar un evento por su grabación.' },
        { status: 400 }
      );
    }

    const ic = await IndividualClass.findById(individualClassId).select('name link description').lean();
    if (!ic) {
      return NextResponse.json({ error: 'Clase individual no encontrada' }, { status: 404 });
    }

    const link = (ic.link && String(ic.link).trim()) || '';
    const videoUrl = toVimeoUrl(link);
    const videoId = extractVimeoId(link) || undefined;
    const videoName = (ic.name && String(ic.name).trim()) || item.videoName || 'Clase';

    const newItem = {
      contentType: 'individualClass',
      individualClassId: new mongoose.Types.ObjectId(individualClassId),
      videoUrl: videoUrl || '',
      videoId,
      videoName,
      orden: item.orden != null ? item.orden : contentIndex,
      moduleClassId: undefined,
      moveCrewEventId: undefined,
      moveCrewEventCreatedInPath: undefined,
    };

    const updatedContents = contents.map((c, i) => (i === contentIndex ? newItem : c));
    const updatedWeeklyContents = weeklyContents.map((w, i) =>
      i === weekIndex ? { ...w, contents: updatedContents } : w
    );

    logbook.weeklyContents = updatedWeeklyContents;
    await logbook.save();

    const weekNumber = (weeklyContents[weekIndex] && weeklyContents[weekIndex].weekNumber != null)
      ? Number(weeklyContents[weekIndex].weekNumber)
      : weekIndex + 1;
    const baseUrl = (process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://mateomove.com').replace(/\/$/, '');
    const pathUrl = `${baseUrl}/weekly-path?id=${logbookId}&week=${weekNumber}&content=${contentIndex}`;

    const miembrosActivos = await Users.find({
      $or: [{ 'subscription.active': true }, { isVip: true }],
    })
      .select('email name validEmail')
      .lean();

    const emailService = EmailService.getInstance();
    let emailsEnviados = 0;
    for (const usuario of miembrosActivos || []) {
      if (!usuario.email || usuario.validEmail !== 'yes') continue;
      const rawName = (usuario.name || 'Miembro').toString().trim();
      const name = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase() : 'Miembro';
      try {
        await emailService.sendEmail({
          type: EmailType.LIVE_SESSION_RECORDING_AVAILABLE,
          to: usuario.email,
          subject: 'La grabación de la sesión en vivo ya está en el camino',
          data: { name, pathUrl },
        });
        emailsEnviados++;
      } catch (e) {
        console.error('[replace-event-with-recording] Error enviando email a', usuario.email, e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Evento reemplazado por la clase individual (grabación). La publicación se mantiene según el cron del camino.',
      emailsEnviados,
    });
  } catch (err) {
    console.error('[replace-event-with-recording]', err);
    return NextResponse.json(
      { error: 'Error al reemplazar evento por grabación', details: err.message },
      { status: 500 }
    );
  }
}
