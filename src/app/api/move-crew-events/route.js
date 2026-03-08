import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../config/connectDB';
import MoveCrewEvent from '../../../models/moveCrewEventModel';
import Users from '../../../models/userModel';

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

/** GET: listar eventos (admin o público para calendario) */
export async function GET() {
  try {
    const events = await MoveCrewEvent.find()
      .sort({ repeatsWeekly: 1, eventDate: 1, startTime: 1 })
      .lean();
    return NextResponse.json(events, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (error) {
    console.error('Error listando eventos Move Crew:', error);
    return NextResponse.json(
      { error: error.message || 'Error al listar eventos' },
      { status: 500 }
    );
  }
}

/** POST: crear evento (solo admin) */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const auth = requireAdmin(cookieStore);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const user = await Users.findById(auth.decoded?.userId || auth.decoded?._id || auth.decoded?.id)
      .select('rol')
      .lean();
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'Solo administradores pueden crear eventos' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, zoomLink, eventDate, startTime, durationMinutes, repeatsWeekly, weekday, timezone } = body;
    if (!title || !zoomLink || !startTime) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: title, zoomLink, startTime' },
        { status: 400 }
      );
    }
    const isRecurring = !!repeatsWeekly;
    if (!isRecurring && !eventDate) {
      return NextResponse.json(
        { error: 'Para eventos únicos se requiere eventDate' },
        { status: 400 }
      );
    }
    if (isRecurring && (weekday == null || weekday < 0 || weekday > 6)) {
      return NextResponse.json(
        { error: 'Para eventos recurrentes se requiere weekday (0-6)' },
        { status: 400 }
      );
    }

    const event = await MoveCrewEvent.create({
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      zoomLink: String(zoomLink).trim(),
      eventDate: eventDate ? new Date(eventDate) : null,
      startTime: String(startTime).trim(),
      durationMinutes: durationMinutes != null ? Math.min(480, Math.max(1, Number(durationMinutes))) : 60,
      repeatsWeekly: isRecurring,
      weekday: isRecurring ? Number(weekday) : null,
      timezone: timezone && String(timezone).trim() ? String(timezone).trim() : 'America/Montevideo'
    });

    return NextResponse.json(event.toObject ? event.toObject() : event, { status: 201 });
  } catch (error) {
    console.error('Error creando evento Move Crew:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear evento' },
      { status: 500 }
    );
  }
}
