import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../../config/connectDB';
import WeeklyLogbook from '../../../../../models/weeklyLogbookModel';
import IndividualClass from '../../../../../models/individualClassModel';
import ModuleClass from '../../../../../models/moduleClassModel';
import ClassModule from '../../../../../models/classModuleModel';

export const revalidate = 0;
export const fetchCache = 'force-no-store';

function toVimeoUrl(link) {
  if (!link || !String(link).trim()) return '';
  const s = String(link).trim();
  if (s.startsWith('http')) return s;
  return `https://vimeo.com/${s}`;
}

function extractVimeoId(urlOrId) {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = String(urlOrId).trim();
  const match = trimmed.match(/(?:vimeo\.com\/)(\d+)/);
  if (match) return match[1];
  if (/^\d+$/.test(trimmed)) return trimmed;
  return null;
}

/**
 * Hidrata cada ítem de contenido con la información completa de la clase asociada por ID,
 * para que el edit del weekly path muestre correctamente módulo, submódulo, nombre, video, tipo, tags, etc.
 */
async function hydrateWeeklyContents(weeklyContents) {
  if (!Array.isArray(weeklyContents)) return;
  for (const week of weeklyContents) {
    const contents = week.contents;
    if (!Array.isArray(contents)) continue;
    for (const item of contents) {
      // Hidratar por individualClassId (aunque no venga contentType)
      if (item.individualClassId && mongoose.Types.ObjectId.isValid(item.individualClassId)) {
        const ic = await IndividualClass.findById(item.individualClassId)
          .select('name link description type tags visibleInLibrary')
          .lean();
        if (ic) {
          item.contentType = 'individualClass';
          const link = (ic.link && String(ic.link).trim()) || '';
          item.videoName = (item.videoName && String(item.videoName).trim()) || (ic.name && String(ic.name).trim()) || '';
          item.videoUrl = toVimeoUrl(link);
          item.videoId = item.videoId || extractVimeoId(link) || undefined;
          item.createdClassDescription = (item.createdClassDescription && String(item.createdClassDescription).trim()) || (ic.description && String(ic.description).trim()) || '';
          item.individualClassType = item.individualClassType || (ic.type && String(ic.type).trim()) || undefined;
          if (Array.isArray(ic.tags) && ic.tags.length > 0) {
            const tagsStr = ic.tags.map((t) => (t && t.title) ? String(t.title).trim() : '').filter(Boolean).join(', ');
            item.individualClassTags = (item.individualClassTags && String(item.individualClassTags).trim()) || tagsStr || undefined;
          }
          if (ic.visibleInLibrary === false) item.createdInWeeklyPathForm = true;
        }
      }
      // Hidratar por moduleClassId (aunque no venga contentType)
      else if (item.moduleClassId && mongoose.Types.ObjectId.isValid(item.moduleClassId)) {
        const mc = await ModuleClass.findById(item.moduleClassId)
          .select('moduleId submoduleSlug name videoUrl videoId duration level materials description visibleInLibrary')
          .lean();
        if (mc) {
          item.contentType = 'moduleClass';
          item.videoName = (item.videoName && String(item.videoName).trim()) || (mc.name && String(mc.name).trim()) || '';
          const url = (mc.videoUrl && String(mc.videoUrl).trim()) || '';
          item.videoUrl = url ? toVimeoUrl(url) : (item.videoUrl && String(item.videoUrl).trim()) || '';
          item.videoId = item.videoId || mc.videoId || undefined;
          if (mc.duration != null) item.videoDuration = mc.duration;
          item.level = mc.level != null ? Number(mc.level) : (item.level != null ? Number(item.level) : 1);
          item.moduleId = item.moduleId || (mc.moduleId ? String(mc.moduleId) : '') || '';
          item.submoduleSlug = (item.submoduleSlug && String(item.submoduleSlug).trim()) || (mc.submoduleSlug && String(mc.submoduleSlug).trim()) || '';
          item.createdClassDescription = (item.createdClassDescription && String(item.createdClassDescription).trim()) || (mc.description && String(mc.description).trim()) || '';
          if (Array.isArray(mc.materials)) item.newModuleClassMaterials = mc.materials;
          if (mc.visibleInLibrary === false) item.createdInWeeklyPathForm = true;

          // Resolver submoduleName desde ClassModule
          if (mc.moduleId && mc.submoduleSlug) {
            const mod = await ClassModule.findById(mc.moduleId).select('submodules').lean();
            if (mod && Array.isArray(mod.submodules)) {
              const sub = mod.submodules.find((s) => (s.slug || '').toLowerCase() === (mc.submoduleSlug || '').toLowerCase());
              if (sub) item.submoduleName = sub.name || item.submoduleName || mc.submoduleSlug;
            }
            if (!item.submoduleName && item.submoduleSlug) item.submoduleName = item.submoduleSlug;
          }
        }
      }
    }
  }
}

export async function GET(req, { params }) {
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
      decoded = verify(userToken, process.env.NEXTAUTH_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de camino requerido' },
        { status: 400 }
      );
    }

    const logbook = await WeeklyLogbook.findById(id).lean();

    if (!logbook) {
      return NextResponse.json(
        { error: 'Camino no encontrada' },
        { status: 404 }
      );
    }

    if (logbook.weeklyContents && Array.isArray(logbook.weeklyContents)) {
      await hydrateWeeklyContents(logbook.weeklyContents);
    }

    return NextResponse.json(
      { logbook },
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
    console.error('Error obteniendo camino:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener la camino' },
      { status: 500 }
    );
  }
}

