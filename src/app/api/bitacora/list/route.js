import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../config/connectDB';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';
import User from '../../../../models/userModel';
import IndividualClass from '../../../../models/individualClassModel';
import ModuleClass from '../../../../models/moduleClassModel';

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

/** Convierte link (id o URL de Vimeo) en URL completa para previsualización */
function toVimeoUrl(link) {
  if (!link || !String(link).trim()) return '';
  const s = String(link).trim();
  if (s.startsWith('http')) return s;
  return `https://vimeo.com/${s}`;
}

/**
 * Hidrata los ítems de contenido con la información completa de la clase (nombre, videoUrl)
 * cuando solo tienen moduleClassId o individualClassId, para que la lista admin muestre nombres y permita previsualizar.
 */
async function hydrateWeeklyContentsForList(weeklyContents) {
  if (!Array.isArray(weeklyContents)) return;
  for (const week of weeklyContents) {
    const contents = week.contents;
    if (!Array.isArray(contents)) continue;
    for (const item of contents) {
      if (item.contentType === 'individualClass' && item.individualClassId && mongoose.Types.ObjectId.isValid(item.individualClassId)) {
        const ic = await IndividualClass.findById(item.individualClassId).select('link name').lean();
        if (ic) {
          const link = (ic.link && String(ic.link).trim()) || '';
          item.videoName = (item.videoName && String(item.videoName).trim()) || (ic.name && String(ic.name).trim()) || '';
          item.videoUrl = toVimeoUrl(link);
          if (!item.videoId) item.videoId = extractVimeoId(link) || undefined;
        }
      } else if (item.contentType === 'moduleClass' && item.moduleClassId && mongoose.Types.ObjectId.isValid(item.moduleClassId)) {
        const mc = await ModuleClass.findById(item.moduleClassId).select('videoUrl videoId name duration').lean();
        if (mc) {
          item.videoName = (item.videoName && String(item.videoName).trim()) || (mc.name && String(mc.name).trim()) || '';
          const url = (mc.videoUrl && String(mc.videoUrl).trim()) || '';
          item.videoUrl = url ? toVimeoUrl(url) : (item.videoUrl && String(item.videoUrl).trim()) || '';
          if (mc.videoId) item.videoId = mc.videoId;
          if (mc.duration != null) item.videoDuration = mc.duration;
        }
      }
    }
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const userToken = cookieStore.get('userToken')?.value;

    if (!userToken) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      // Usar NEXTAUTH_SECRET como en otros endpoints de camino
      decoded = verify(userToken, process.env.NEXTAUTH_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener el userId del token
    const userId = decoded.userId || decoded._id || decoded.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Token inválido: no se pudo obtener el ID de usuario' },
        { status: 401 }
      );
    }

    // Obtener el usuario de la base de datos para verificar su rol
    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    // Verificar que sea Admin
    if (user.rol !== 'Admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden acceder.' },
        { status: 403 }
      );
    }

    // Obtener todas las caminos ordenadas por año y mes (más recientes primero)
    const logbooks = await WeeklyLogbook.find({})
      .sort({ year: -1, month: -1, createdAt: -1 })
      .lean();

    // Poblar cada ítem de contenido con nombre y videoUrl desde la clase (por moduleClassId/individualClassId)
    for (const logbook of logbooks || []) {
      if (logbook.weeklyContents && Array.isArray(logbook.weeklyContents)) {
        await hydrateWeeklyContentsForList(logbook.weeklyContents);
      }
    }

    return NextResponse.json(
      { 
        success: true,
        logbooks: logbooks || []
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Error obteniendo lista de caminos:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error al obtener la lista de caminos' 
      },
      { status: 500 }
    );
  }
}

