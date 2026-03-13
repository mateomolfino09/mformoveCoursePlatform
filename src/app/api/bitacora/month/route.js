import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../config/connectDB';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';
import IndividualClass from '../../../../models/individualClassModel';
import ModuleClass from '../../../../models/moduleClassModel';
import MoveCrewEvent from '../../../../models/moveCrewEventModel';
import Users from '../../../../models/userModel';

export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** Extrae el id de Vimeo de una URL o string (ej. "https://vimeo.com/123" -> "123") */
function extractVimeoId(urlOrId) {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = urlOrId.trim();
  const match = trimmed.match(/(?:vimeo\.com\/)(\d+)/);
  if (match) return match[1];
  if (/^\d+$/.test(trimmed)) return trimmed;
  return null;
}

/** Hidrata los ítems de contenido que solo tienen individualClassId o moduleClassId (trae videoUrl, videoName, etc. desde la fuente). */
async function hydrateWeeklyContents(weeklyContents) {
  if (!Array.isArray(weeklyContents)) return;
  for (const week of weeklyContents) {
    const contents = week.contents;
    if (!Array.isArray(contents)) continue;
    for (const item of contents) {
      const needsVideo = (item.contentType === 'individualClass' || item.contentType === 'moduleClass') &&
        (!item.videoUrl || !String(item.videoUrl).trim());
      const needsZoomHydration = item.contentType === 'zoomEvent' && item.moveCrewEventId && mongoose.Types.ObjectId.isValid(item.moveCrewEventId);
      if (!needsVideo && !needsZoomHydration) continue;

      if (needsZoomHydration) {
        const ev = await MoveCrewEvent.findById(item.moveCrewEventId).lean();
        if (ev) {
          item.title = (ev.title && String(ev.title).trim()) || item.title || 'Clase en vivo';
          item.description = (ev.description && String(ev.description).trim()) || item.description || '';
          item.videoName = item.title;
          item.zoomLink = (ev.zoomLink && String(ev.zoomLink).trim()) || '';
          item.eventDate = ev.eventDate;
          item.startTime = ev.startTime;
          item.durationMinutes = ev.durationMinutes;
        }
      } else if (item.contentType === 'individualClass' && item.individualClassId && mongoose.Types.ObjectId.isValid(item.individualClassId)) {
        const ic = await IndividualClass.findById(item.individualClassId).select('link name').lean();
        if (ic) {
          const link = (ic.link && String(ic.link).trim()) || '';
          item.videoUrl = link;
          item.videoName = (item.videoName && String(item.videoName).trim()) || (ic.name && String(ic.name).trim()) || '';
          if (!item.videoId) item.videoId = extractVimeoId(link) || undefined;
        }
      } else if (item.contentType === 'moduleClass' && item.moduleClassId && mongoose.Types.ObjectId.isValid(item.moduleClassId)) {
        const mc = await ModuleClass.findById(item.moduleClassId).select('videoUrl videoId name duration').lean();
        if (mc) {
          item.videoUrl = (mc.videoUrl && String(mc.videoUrl).trim()) || item.videoUrl || '';
          item.videoName = (item.videoName && String(item.videoName).trim()) || (mc.name && String(mc.name).trim()) || '';
          if (mc.videoId) item.videoId = mc.videoId;
          if (mc.duration != null) item.videoDuration = mc.duration;
        }
      }
    }
  }
}

/** Martes de publicación en el mes del path: si publishDate no es martes o no pertenece al mes, usar el martes de esa semana. */
function getFirstTuesdayOfMonth(y, m) {
  for (let d = 0; d < 7; d++) {
    const date = new Date(y, m - 1, 1 + d);
    if (date.getDay() === 2) return new Date(date.getTime());
  }
  return new Date(y, m - 1, 1);
}
function getTuesdayForWeek(y, m, weekNum) {
  const firstTue = getFirstTuesdayOfMonth(y, m);
  const result = new Date(firstTue);
  result.setDate(result.getDate() + (Math.max(1, Number(weekNum) || 1) - 1) * 7);
  return result;
}
/** Número de semana (1-4) que contiene esta fecha: primer martes del mes = semana 1. Si la fecha es anterior al primer martes, null. */
function getWeekNumberForDate(date, logbookYear, logbookMonth) {
  const firstTue = getFirstTuesdayOfMonth(logbookYear, logbookMonth);
  firstTue.setHours(0, 0, 0, 0);
  const t = date.getTime();
  const first = firstTue.getTime();
  if (t < first) return null;
  const diffDays = (t - first) / (24 * 60 * 60 * 1000);
  const weekNum = 1 + Math.floor(diffDays / 7);
  return weekNum < 1 ? 1 : Math.min(weekNum, 4);
}
function normalizePublishDate(publishDateVal, y, m, weekNum) {
  const d = publishDateVal ? new Date(publishDateVal) : null;
  if (!d || Number.isNaN(d.getTime())) return getTuesdayForWeek(y, m, weekNum);
  d.setHours(0, 0, 0, 0);
  const isTuesday = d.getDay() === 2;
  const inPathMonth = d.getFullYear() === y && d.getMonth() === m - 1;
  if (isTuesday && inPathMonth) return d;
  return getTuesdayForWeek(y, m, weekNum);
}

/** Jueves de la semana (publishDate es el martes, +2 días). */
function getThursdayOfWeek(publishDate) {
  const d = new Date(publishDate);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 2);
  return d;
}

/** Desbloqueo: la semana está desbloqueada si es anterior o igual a la semana actual (por fecha) o si ya fue publicada por el cron (isPublished). Contenidos según maxContentIndexUnlocked (martes 0 y 1, jueves +2). */
function applyPerContentUnlock(weeklyContents, logbookYear, logbookMonth, unlockPerContent) {
  if (!Array.isArray(weeklyContents)) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentWeekNum = logbookYear != null && logbookMonth != null ? getWeekNumberForDate(today, logbookYear, logbookMonth) : null;
  const perContent = unlockPerContent !== false;
  for (const week of weeklyContents) {
    const weekNum = Math.max(1, Number(week.weekNumber) || 1);
    if (logbookYear != null && logbookMonth != null) {
      week.publishDate = normalizePublishDate(week.publishDate, logbookYear, logbookMonth, weekNum);
    }
    const contents = week.contents;
    const publishDate = new Date(week.publishDate);
    publishDate.setHours(0, 0, 0, 0);
    // Respetar isPublished del cron: si el cron marcó la semana como publicada, mostrarla desbloqueada aunque "today" sea anterior al path
    week.isUnlocked = (currentWeekNum != null && weekNum <= currentWeekNum) || week.isPublished === true;
    const maxIdx = week.maxContentIndexUnlocked != null && Number.isInteger(week.maxContentIndexUnlocked) ? Number(week.maxContentIndexUnlocked) : -1;
    const useCronSchedule = maxIdx >= 0;
    const isPastWeek = currentWeekNum != null && weekNum < currentWeekNum;
    if (!Array.isArray(contents)) continue;
    if (perContent) {
      if (useCronSchedule) {
        for (let i = 0; i < contents.length; i++) {
          contents[i].isUnlocked = week.isUnlocked && i <= maxIdx;
          const releaseDay = i <= 1 ? publishDate : getThursdayOfWeek(publishDate);
          const y = releaseDay.getFullYear();
          const mo = String(releaseDay.getMonth() + 1).padStart(2, '0');
          const d = String(releaseDay.getDate()).padStart(2, '0');
          contents[i].releaseDate = `${y}-${mo}-${d}`;
        }
      } else if (isPastWeek) {
        for (let i = 0; i < contents.length; i++) {
          contents[i].isUnlocked = true;
          const releaseDay = i <= 1 ? publishDate : getThursdayOfWeek(publishDate);
          const y = releaseDay.getFullYear();
          const mo = String(releaseDay.getMonth() + 1).padStart(2, '0');
          const d = String(releaseDay.getDate()).padStart(2, '0');
          contents[i].releaseDate = `${y}-${mo}-${d}`;
        }
      } else {
        for (let i = 0; i < contents.length; i++) {
          const unlockDate = new Date(publishDate);
          unlockDate.setDate(unlockDate.getDate() + i);
          contents[i].isUnlocked = unlockDate.getTime() <= today.getTime();
          const y = unlockDate.getFullYear();
          const mo = String(unlockDate.getMonth() + 1).padStart(2, '0');
          const d = String(unlockDate.getDate()).padStart(2, '0');
          contents[i].releaseDate = `${y}-${mo}-${d}`;
        }
      }
    } else {
      for (let i = 0; i < contents.length; i++) {
        contents[i].isUnlocked = week.isUnlocked;
        const y = publishDate.getFullYear();
        const mo = String(publishDate.getMonth() + 1).padStart(2, '0');
        const d = String(publishDate.getDate()).padStart(2, '0');
        contents[i].releaseDate = `${y}-${mo}-${d}`;
      }
    }
  }
}

export async function GET(req) {
  try {
    // Conectar a la base de datos
    await connectDB();
    // Obtener el token del usuario desde las cookies
    const cookieStore = cookies();
    const userToken = cookieStore.get('userToken')?.value;
    
    if (!userToken) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de query (id, mes y año)
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    // Previsualizar por ID solo permitido para administradores
    if (idParam) {
      let decoded;
      try {
        decoded = verify(userToken, process.env.NEXTAUTH_SECRET);
      } catch {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      const userId = decoded?.userId || decoded?._id || decoded?.id;
      const user = await Users.findById(userId).select('rol').lean();
      if (!user || user.rol !== 'Admin') {
        return NextResponse.json(
          { error: 'Solo administradores pueden previsualizar un camino por ID' },
          { status: 403 }
        );
      }
    }

    let logbook;

    // Si se proporciona un ID, buscar por ID directamente
    if (idParam) {
      logbook = await WeeklyLogbook.findById(idParam).lean();
      // Si no se encuentra por ID, buscar la más reciente como fallback
      if (!logbook) {
        logbook = await WeeklyLogbook.findOne({ isBaseBitacora: { $ne: true } })
          .sort({ year: -1, month: -1 })
          .lean();
      }
    } else if (monthParam && yearParam) {
      // Si se proporcionan mes y año, buscar por esos parámetros
      const targetMonth = parseInt(monthParam, 10);
      const targetYear = parseInt(yearParam, 10);
      
      logbook = await WeeklyLogbook.findOne({
        year: targetYear,
        month: targetMonth,
        isBaseBitacora: { $ne: true } // Excluir caminos base
      }).lean();
      
      // Si no existe, buscar la más reciente como fallback
      if (!logbook) {
        logbook = await WeeklyLogbook.findOne({ isBaseBitacora: { $ne: true } })
          .sort({ year: -1, month: -1 })
          .lean();
      }
    } else {
      // Si no se proporcionan parámetros, usar el mes/año actual
      const now = new Date();
      const targetMonth = now.getMonth() + 1; // Los meses son 0-indexed en JS
      const targetYear = now.getFullYear();

      logbook = await WeeklyLogbook.findOne({
        year: targetYear,
        month: targetMonth,
        isBaseBitacora: { $ne: true } // Excluir caminos base
      }).lean();

      // Si no existe la del mes actual, buscar la más reciente
      if (!logbook) {
        logbook = await WeeklyLogbook.findOne({ isBaseBitacora: { $ne: true } })
          .sort({ year: -1, month: -1 })
          .lean();
      }
    }

    if (!logbook) {
      return NextResponse.json(
        { error: 'No se encontró ninguna camino' },
        { status: 404 }
      );
    }

    // unlockPerContent: si viene null/undefined se trata como true (desbloqueo por contenido)
    const unlockPerContent = logbook.unlockPerContent !== false;
    if (logbook.weeklyContents && logbook.weeklyContents.length > 0) {
      applyPerContentUnlock(logbook.weeklyContents, logbook.year, logbook.month, unlockPerContent);
      await hydrateWeeklyContents(logbook.weeklyContents);
    }
    // Hidratar también el contenido global de calentamiento (warmUpContent) si existe,
    // usando la misma función que para los contenidos semanales.
    if (logbook.warmUpContent && typeof logbook.warmUpContent === 'object') {
      const fakeWeek = { contents: [logbook.warmUpContent] };
      await hydrateWeeklyContents([fakeWeek]);
    }

    return NextResponse.json(
      { logbook },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error obteniendo camino del mes:', error);
    return NextResponse.json(
      { error: 'Error al obtener la camino', message: error.message },
      { status: 500 }
    );
  }
}

