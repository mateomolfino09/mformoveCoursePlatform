import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../../config/connectDB';
import IndividualClass from '../../../../../models/individualClassModel';
import Users from '../../../../../models/userModel';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** PATCH: actualizar clase (moduleId, submoduleSlug, level). Requiere admin. */
export async function PATCH(req, { params }) {
  try {
    const { id } = params;
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
