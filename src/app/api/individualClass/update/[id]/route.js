import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../../config/connectDB';
import IndividualClass from '../../../../../models/individualClassModel';
import Users from '../../../../../models/userModel';
import getVimeoVideo from '../../getVimeoVideo.ts';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function extractVimeoId(videoUrlOrId) {
  if (!videoUrlOrId || typeof videoUrlOrId !== 'string') return null;
  const s = String(videoUrlOrId).trim();
  const match = s.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (match) return match[1];
  if (/^\d+$/.test(s)) return s;
  return null;
}

/** PATCH: actualizar clase (name, description, type, tags, link, moduleId, submoduleSlug, level). Requiere admin. */
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID de clase inválido' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('userToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    let decoded;
    try {
      decoded = verify(token, process.env.NEXTAUTH_SECRET);
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    const user = await Users.findById(decoded?.userId || decoded?._id || decoded?.id).lean();
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'Solo administradores pueden actualizar clases' }, { status: 403 });
    }

    const body = await req.json();
    const update = {};

    if (body.moduleId !== undefined) {
      update.moduleId = body.moduleId === null || body.moduleId === '' ? null : (mongoose.Types.ObjectId.isValid(body.moduleId) ? new mongoose.Types.ObjectId(body.moduleId) : null);
    }
    if (body.submoduleSlug !== undefined) {
      update.submoduleSlug = body.submoduleSlug === null || body.submoduleSlug === '' ? null : String(body.submoduleSlug).trim();
    }
    if (body.level !== undefined) {
      const level = Number(body.level);
      if (level >= 1 && level <= 10) {
        update.level = String(level);
      }
    }
    if (body.name !== undefined && String(body.name).trim()) {
      update.name = String(body.name).trim();
    }
    if (body.description !== undefined) {
      update.description = String(body.description ?? '').trim();
    }
    if (body.type !== undefined && String(body.type).trim()) {
      update.type = String(body.type).trim();
    }
    if (body.tags !== undefined) {
      const tagsInput = Array.isArray(body.tags)
        ? body.tags.filter((t) => t != null && String(t).trim()).map((t) => String(t).trim())
        : [];
      update.tags = tagsInput.map((title, index) => ({ id: index + 1, title }));
    }

    const videoInput = body.link ?? body.videoUrl ?? body.videoId;
    if (videoInput != null && String(videoInput).trim()) {
      const vimeoId = extractVimeoId(videoInput) || String(videoInput).trim();
      const vimeoVideo = await getVimeoVideo(vimeoId);
      if (vimeoVideo && vimeoVideo.embed?.html) {
        const duration = Number(vimeoVideo.duration) || 0;
        update.link = vimeoId;
        update.html = vimeoVideo.embed.html;
        update.totalTime = duration;
        update.hours = Math.floor(duration / 3600);
        update.minutes = Math.floor((duration % 3600) / 60);
        update.seconds = Math.floor(duration % 60);
        const fallbackImage = process.env.DEFAULT_CLASS_IMAGE_URL || 'https://mateomove.com/images/MFORMOVE_blanco.png';
        update.image_url = vimeoVideo.pictures?.sizes?.[0]?.link || vimeoVideo.pictures?.base_link || fallbackImage;
        update.image_base_link = vimeoVideo.pictures?.base_link || update.image_url;
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
    }

    const updated = await IndividualClass.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: update },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating individual class:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar la clase' }, { status: 500 });
  }
}
