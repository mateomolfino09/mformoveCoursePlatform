import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../config/connectDB';
import ModuleClass from '../../../../models/moduleClassModel';
import Users from '../../../../models/userModel';
import { fetchVimeoMeta } from '../../../../lib/vimeoMeta';

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

/**
 * POST: crear clase de módulo desde el formulario de weekly path.
 * Solo campos esenciales (nombre, descripción, video). visibleInLibrary: false.
 */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const userId = getAuthUser(cookieStore);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const user = await Users.findById(userId).select('rol').lean();
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'Solo administradores pueden crear clases desde el camino' }, { status: 403 });
    }

    const ALLOWED_MATERIALS = ['baston', 'banda elastica', 'banco', 'pelota'];
    const body = await req.json();
    const { moduleId, submoduleSlug, name, description, videoUrl, videoId, level, materials } = body;

    if (!moduleId || !name || !videoUrl?.trim()) {
      return NextResponse.json(
        { error: 'moduleId, name y videoUrl son requeridos' },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return NextResponse.json({ error: 'moduleId inválido' }, { status: 400 });
    }

    const levelNum = Math.min(10, Math.max(1, Number(level) || 1));
    const slugNormalized = (submoduleSlug != null && String(submoduleSlug).trim() !== '')
      ? String(submoduleSlug).trim().toLowerCase()
      : '__main__';

    let resolvedVideoId = (videoId != null && String(videoId).trim()) ? String(videoId).trim() : null;
    if (!resolvedVideoId && videoUrl && String(videoUrl).trim()) {
      const vimeoMatch = String(videoUrl).trim().match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) resolvedVideoId = vimeoMatch[1];
    }

    const materialsArr = Array.isArray(materials)
      ? materials.filter((m) => ALLOWED_MATERIALS.includes(String(m).trim()))
      : [];

    let finalThumbnail = '';
    let finalDuration = 0;
    const vimeoUrlOrId = (videoUrl && String(videoUrl).trim()) || resolvedVideoId;
    if (vimeoUrlOrId) {
      const vimeoMeta = await fetchVimeoMeta(vimeoUrlOrId);
      if (vimeoMeta.thumbnail) finalThumbnail = vimeoMeta.thumbnail;
      if (vimeoMeta.duration != null) finalDuration = vimeoMeta.duration;
    }

    const doc = await ModuleClass.create({
      moduleId: new mongoose.Types.ObjectId(moduleId),
      submoduleSlug: slugNormalized,
      name: String(name).trim(),
      description: description != null ? String(description).trim() : '',
      videoUrl: String(videoUrl).trim(),
      videoId: resolvedVideoId || undefined,
      videoThumbnail: finalThumbnail,
      duration: finalDuration,
      level: levelNum,
      order: 0,
      materials: materialsArr,
      visibleInLibrary: false
    });

    return NextResponse.json(doc.toObject ? doc.toObject() : doc, { status: 201 });
  } catch (error) {
    console.error('Error creating module class from weekly path:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear la clase' },
      { status: 500 }
    );
  }
}
