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

/** GET: listar clases de módulo. moduleId requerido; submoduleSlug opcional (si no se envía, devuelve todas las del módulo). */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get('moduleId');
    const submoduleSlug = searchParams.get('submoduleSlug');

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
    const body = await req.json();
    const { moduleId, submoduleSlug, name, description, videoUrl, videoId, videoThumbnail, duration, level, order, materials } = body;

    if (!moduleId || !submoduleSlug || !name) {
      return NextResponse.json(
        { error: 'moduleId, submoduleSlug y name son requeridos' },
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

    const doc = await ModuleClass.create({
      moduleId: new mongoose.Types.ObjectId(moduleId),
      submoduleSlug: String(submoduleSlug).trim().toLowerCase(),
      name: String(name).trim(),
      description: description != null ? String(description) : '',
      videoUrl: videoUrl != null ? String(videoUrl) : '',
      videoId: videoId != null ? String(videoId) : undefined,
      videoThumbnail: videoThumbnail != null ? String(videoThumbnail) : '',
      duration: Number(duration) || 0,
      level: levelNum,
      order: Number(order) || 0,
      materials: materialsArr
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
