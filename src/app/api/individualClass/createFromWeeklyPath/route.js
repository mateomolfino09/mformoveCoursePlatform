import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import IndividualClass from '../../../../models/individualClassModel';
import Users from '../../../../models/userModel';
import getVimeoVideo from '../getVimeoVideo.ts';

export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** Extrae el ID de Vimeo de una URL o devuelve el string si ya es un id numérico */
function extractVimeoId(videoUrlOrId) {
  if (!videoUrlOrId || typeof videoUrlOrId !== 'string') return null;
  const s = videoUrlOrId.trim();
  const match = s.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (match) return match[1];
  if (/^\d+$/.test(s)) return s;
  return null;
}

/**
 * POST: crear una clase individual desde el formulario de weekly path.
 * No se publica en la biblioteca (visibleInLibrary: false) hasta que el job publique la última semana.
 * Body: { name, description, videoUrl o videoId, image_url (opcional), userEmail }
 */
export async function POST(req) {
  try {
    await connectDB();

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
    const user = await Users.findOne({ _id: decoded?.userId || decoded?._id || decoded?.id }).select('rol').lean();
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'Solo administradores pueden crear clases desde el camino' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, videoUrl, videoId, image_url, userEmail, type: typeFilter, tags: tagsInput } = body;

    const vimeoId = videoId || extractVimeoId(videoUrl);
    if (!vimeoId) {
      return NextResponse.json(
        { error: 'videoId o videoUrl de Vimeo es requerido' },
        { status: 400 }
      );
    }
    if (!(name && String(name).trim())) {
      return NextResponse.json({ error: 'name es requerido' }, { status: 400 });
    }
    if (!(description && String(description).trim())) {
      return NextResponse.json({ error: 'description es requerido' }, { status: 400 });
    }

    const vimeoVideo = await getVimeoVideo(vimeoId);
    if (!vimeoVideo || !vimeoVideo.embed?.html) {
      return NextResponse.json(
        { error: 'No se pudo obtener la información del video de Vimeo' },
        { status: 400 }
      );
    }

    const duration = Number(vimeoVideo.duration) || 0;
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    const fallbackImage =
      process.env.DEFAULT_CLASS_IMAGE_URL ||
      'https://mateomove.com/images/MFORMOVE_blanco.png';
    const imageUrl = (image_url && String(image_url).trim()) || vimeoVideo.pictures?.sizes?.[0]?.link || vimeoVideo.pictures?.base_link || fallbackImage;
    const imageBaseLink = vimeoVideo.pictures?.base_link || imageUrl;

    const lastClass = await IndividualClass.findOne().sort({ id: -1 }).lean();
    const nextId = (lastClass && lastClass.id != null) ? Number(lastClass.id) + 1 : 1;

    const ClassModuleModel = (await import('../../../../models/classModuleModel')).default;
    const firstModule = await ClassModuleModel.findOne({ isActive: true }).sort({ createdAt: 1 }).select('_id slug').lean();
    const typeValue = (typeFilter && String(typeFilter).trim()) || (firstModule ? firstModule.slug : 'general');

    const tagsArray = Array.isArray(tagsInput)
      ? tagsInput.filter((t) => t != null && String(t).trim()).map((t) => String(t).trim())
      : [];
    const tags = tagsArray.map((title, index) => ({ id: index + 1, title }));

    const newClass = await IndividualClass.create({
      id: nextId,
      name: String(name).trim(),
      description: String(description).trim(),
      image_url: imageUrl,
      totalTime: duration,
      seconds,
      minutes,
      hours,
      level: '1',
      type: typeValue,
      moduleId: null,
      isFree: false,
      image_base_link: imageBaseLink,
      html: vimeoVideo.embed.html,
      link: vimeoId,
      tags,
      visibleInLibrary: false
    });

    return NextResponse.json(newClass.toObject ? newClass.toObject() : newClass, { status: 201 });
  } catch (error) {
    console.error('Error creating individual class from weekly path:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear la clase' },
      { status: 500 }
    );
  }
}
