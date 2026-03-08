import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../config/connectDB';
import MoveCrewEvent from '../../../../models/moveCrewEventModel';
import Users from '../../../../models/userModel';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function requireAdmin(cookieStore) {
  const token = cookieStore.get('userToken')?.value;
  if (!token) return { error: 'No autorizado', status: 401 };
  let decoded;
  try {
    decoded = verify(token, process.env.NEXTAUTH_SECRET);
  } catch {
    return { error: 'Token inválido', status: 401 };
  }
  return { decoded };
}

/** GET: obtener un evento por ID */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    const event = await MoveCrewEvent.findById(id).lean();
    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }
    return NextResponse.json(event, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (error) {
    console.error('Error obteniendo evento Move Crew:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener evento' },
      { status: 500 }
    );
  }
}

/** PATCH: actualizar evento (solo admin) */
export async function PATCH(req, { params }) {
  try {
    const cookieStore = await cookies();
    const auth = requireAdmin(cookieStore);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const user = await Users.findById(auth.decoded?.userId || auth.decoded?._id || auth.decoded?.id)
      .select('rol')
      .lean();
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'Solo administradores pueden actualizar eventos' }, { status: 403 });
    }

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const update = {};
    if (body.title !== undefined) update.title = String(body.title).trim();
    if (body.description !== undefined) update.description = String(body.description).trim();
    if (body.zoomLink !== undefined) update.zoomLink = String(body.zoomLink).trim();
    if (body.eventDate !== undefined) update.eventDate = body.eventDate ? new Date(body.eventDate) : null;
    if (body.startTime !== undefined) update.startTime = String(body.startTime).trim();
    if (body.durationMinutes !== undefined) {
      update.durationMinutes = Math.min(480, Math.max(1, Number(body.durationMinutes)));
    }
    if (body.repeatsWeekly !== undefined) update.repeatsWeekly = !!body.repeatsWeekly;
    if (body.weekday !== undefined) update.weekday = body.repeatsWeekly ? Number(body.weekday) : null;
    if (body.timezone !== undefined) update.timezone = String(body.timezone).trim() || 'America/Montevideo';

    const event = await MoveCrewEvent.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).lean();

    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }
    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error('Error actualizando evento Move Crew:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar evento' },
      { status: 500 }
    );
  }
}

/** DELETE: eliminar evento (solo admin) */
export async function DELETE(req, { params }) {
  try {
    const cookieStore = await cookies();
    const auth = requireAdmin(cookieStore);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const user = await Users.findById(auth.decoded?.userId || auth.decoded?._id || auth.decoded?.id)
      .select('rol')
      .lean();
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'Solo administradores pueden eliminar eventos' }, { status: 403 });
    }

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const deleted = await MoveCrewEvent.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error eliminando evento Move Crew:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar evento' },
      { status: 500 }
    );
  }
}
