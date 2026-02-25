import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import connectDB from '../../../../config/connectDB';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';
import IndividualClass from '../../../../models/individualClassModel';
import ModuleClass from '../../../../models/moduleClassModel';

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
      if (!needsVideo) continue;

      if (item.contentType === 'individualClass' && item.individualClassId && mongoose.Types.ObjectId.isValid(item.individualClassId)) {
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

    // Hidratar contenidos que solo tienen individualClassId o moduleClassId (traer videoUrl, videoName desde IndividualClass / ModuleClass)
    if (logbook.weeklyContents && logbook.weeklyContents.length > 0) {
      await hydrateWeeklyContents(logbook.weeklyContents);
      // Liberar semana por fecha: si publishDate ya pasó, la semana está desbloqueada
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (const week of logbook.weeklyContents) {
        const pub = week.publishDate ? new Date(week.publishDate) : null;
        if (pub) {
          pub.setHours(0, 0, 0, 0);
          if (pub <= today) week.isUnlocked = true;
        }
      }
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

