import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../config/connectDB';
import ModuleClass from '../../../../models/moduleClassModel';
import Users from '../../../../models/userModel';

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

/** GET: obtener una clase de módulo por id (público, para reproducir en biblioteca) */
export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    const doc = await ModuleClass.findById(id).lean();
    if (!doc) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 });
    }
    return NextResponse.json(doc, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    console.error('Error fetching module class:', error);
    return NextResponse.json({ error: error.message || 'Error al obtener la clase' }, { status: 500 });
  }
}

/** PATCH: actualizar clase de módulo (solo admin) */
export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const userId = getAuthUser(cookieStore);
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const user = await Users.findById(userId).select('rol').lean();
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'Solo administradores pueden actualizar' }, { status: 403 });
    }

    const ALLOWED_MATERIALS = ['baston', 'banda elastica', 'banco', 'pelota'];
    const body = await req.json();
    const update = {};
    if (body.name !== undefined) update.name = String(body.name).trim();
    if (body.description !== undefined) update.description = String(body.description);
    if (body.videoUrl !== undefined) update.videoUrl = String(body.videoUrl);
    if (body.videoId !== undefined) update.videoId = body.videoId ? String(body.videoId) : undefined;
    if (body.videoThumbnail !== undefined) update.videoThumbnail = String(body.videoThumbnail);
    if (body.duration !== undefined) update.duration = Number(body.duration) || 0;
    if (body.level !== undefined) {
      const n = Number(body.level);
      if (n >= 1 && n <= 10) update.level = n;
    }
    if (body.order !== undefined) update.order = Number(body.order) || 0;
    if (body.materials !== undefined) {
      update.materials = Array.isArray(body.materials)
        ? body.materials.filter((m) => ALLOWED_MATERIALS.includes(String(m).trim()))
        : [];
    }

    const vimeoUrlOrId = (update.videoUrl && String(update.videoUrl).trim()) || (update.videoId && String(update.videoId).trim());
    const thumbnailMissing = !(update.videoThumbnail && String(update.videoThumbnail).trim());
    if (vimeoUrlOrId && thumbnailMissing) {
      const vimeoMeta = await fetchVimeoThumbnail(vimeoUrlOrId);
      if (vimeoMeta.thumbnail) update.videoThumbnail = vimeoMeta.thumbnail;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
    }

    const updated = await ModuleClass.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: update },
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: 'Clase de módulo no encontrada' }, { status: 404 });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating module class:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar' }, { status: 500 });
  }
}

/** DELETE: eliminar clase de módulo (solo admin) */
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const userId = getAuthUser(cookieStore);
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const user = await Users.findById(userId).select('rol').lean();
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'Solo administradores pueden eliminar' }, { status: 403 });
    }

    const deleted = await ModuleClass.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) });
    if (!deleted) return NextResponse.json({ error: 'Clase de módulo no encontrada' }, { status: 404 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting module class:', error);
    return NextResponse.json({ error: error.message || 'Error al eliminar' }, { status: 500 });
  }
}
