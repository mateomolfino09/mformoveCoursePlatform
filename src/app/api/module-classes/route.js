import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../config/connectDB';
import ModuleClass from '../../../models/moduleClassModel';
import Users from '../../../models/userModel';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function getAuthUser(cookieStore) {
  const token = cookieStore.get('userToken')?.value;
  if (!token) return null;
  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET);
    return decoded?.userId || decoded?._id || decoded?.id;
  } catch {
    return null;
  }
}

/** Obtiene thumbnail y duración de Vimeo vía oEmbed. videoUrlOrId: URL completa o id numérico. */
async function fetchVimeoThumbnail(videoUrlOrId) {
  try {
    const url = typeof videoUrlOrId === 'string' && videoUrlOrId.trim()
      ? /^\d+$/.test(videoUrlOrId.trim())
        ? `https://vimeo.com/${videoUrlOrId.trim()}`
        : videoUrlOrId.trim()
      : '';
    if (!url || !url.includes('vimeo.com')) return { thumbnail: '', duration: undefined };
    const resp = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
    if (!resp.ok) return { thumbnail: '', duration: undefined };
    const data = await resp.json();
    return {
      thumbnail: data.thumbnail_url || '',
      duration: data.duration != null ? Number(data.duration) : undefined
    };
  } catch {
    return { thumbnail: '', duration: undefined };
  }
}

/** GET: listar clases de módulo. moduleId requerido; submoduleSlug opcional. includeUnpublished=1 incluye visibleInLibrary:false (admin weekly path). */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get('moduleId');
    const submoduleSlug = searchParams.get('submoduleSlug');
    const includeUnpublished = searchParams.get('includeUnpublished') === '1';

    if (!moduleId) {
      return NextResponse.json(
        { error: 'moduleId es requerido' },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return NextResponse.json({ error: 'moduleId inválido' }, { status: 400 });
    }

    const query = { moduleId: new mongoose.Types.ObjectId(moduleId) };
    if (submoduleSlug) query.submoduleSlug = submoduleSlug;
    if (!includeUnpublished) query.visibleInLibrary = { $ne: false };

    const list = await ModuleClass.find(query)
      .sort({ submoduleSlug: 1, order: 1, createdAt: 1 })
      .lean();

    return NextResponse.json(list, { status: 200 });
  } catch (error) {
    console.error('Error listing module classes:', error);
    return NextResponse.json(
      { error: error.message || 'Error al listar clases de módulo' },
      { status: 500 }
    );
  }
}

/** POST: crear clase de módulo (solo admin) */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const userId = getAuthUser(cookieStore);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const user = await Users.findById(userId).select('rol').lean();
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'Solo administradores pueden crear clases de módulo' }, { status: 403 });
    }

    const ALLOWED_MATERIALS = ['baston', 'banda elastica', 'banco', 'pelota'];
    const body = await req.clone().json();
    const { moduleId, submoduleSlug, name, description, videoUrl, videoId, videoThumbnail, duration, level, order, materials } = body;

    if (!moduleId || !name) {
      return NextResponse.json(
        { error: 'moduleId y name son requeridos' },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return NextResponse.json({ error: 'moduleId inválido' }, { status: 400 });
    }

    const levelNum = Math.min(10, Math.max(1, Number(level) || 1));
    const materialsArr = Array.isArray(materials)
      ? materials.filter((m) => ALLOWED_MATERIALS.includes(String(m).trim()))
      : [];
    const slugNormalized = (submoduleSlug != null && String(submoduleSlug).trim() !== '')
      ? String(submoduleSlug).trim().toLowerCase()
      : '__main__';

    let finalThumbnail = videoThumbnail != null ? String(videoThumbnail).trim() : '';
    let finalDuration = Number(duration) || 0;
    const vimeoUrlOrId = (videoUrl && String(videoUrl).trim()) || (videoId && String(videoId).trim());
    if (vimeoUrlOrId && !finalThumbnail) {
      const vimeoMeta = await fetchVimeoThumbnail(vimeoUrlOrId);
      if (vimeoMeta.thumbnail) finalThumbnail = vimeoMeta.thumbnail;
      if (vimeoMeta.duration != null && !finalDuration) finalDuration = vimeoMeta.duration;
    }

    const doc = await ModuleClass.create({
      moduleId: new mongoose.Types.ObjectId(moduleId),
      submoduleSlug: slugNormalized,
      name: String(name).trim(),
      description: description != null ? String(description) : '',
      videoUrl: videoUrl != null ? String(videoUrl) : '',
      videoId: videoId != null ? String(videoId) : undefined,
      videoThumbnail: finalThumbnail,
      duration: finalDuration,
      level: levelNum,
      order: Number(order) || 0,
      materials: materialsArr,
      visibleInLibrary: typeof visibleInLibrary === 'boolean' ? visibleInLibrary : true
    });

    return NextResponse.json(doc.toObject ? doc.toObject() : doc, { status: 201 });
  } catch (error) {
    console.error('Error creating module class:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear clase de módulo' },
      { status: 500 }
    );
  }
}
