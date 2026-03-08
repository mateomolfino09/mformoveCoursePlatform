import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../../../config/connectDB';
import MoveCrewEvent from '../../../../../models/moveCrewEventModel';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** Uruguay = UTC-3. Offset para construir fecha en hora local Uruguay. */
const URUGUAY_OFFSET = '-03:00';

/**
 * Dado un evento con eventDate, startTime y durationMinutes, devuelve start y end como Date (UTC).
 * eventDate + startTime se interpretan en hora Uruguay (America/Montevideo).
 * Para eventos recurrentes sin eventDate se usa una fecha de referencia (hoy o la semana actual).
 */
function getEventStartEnd(event, referenceDate = null) {
  const d = event.eventDate ? new Date(event.eventDate) : (referenceDate ? new Date(referenceDate) : new Date());
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const [h, m] = (event.startTime || '00:00').split(':').map(Number);
  const timeStr = `${String(h || 0).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}:00`;
  const start = new Date(`${y}-${mo}-${day}T${timeStr}${URUGUAY_OFFSET}`);
  const durationMs = (event.durationMinutes || 60) * 60 * 1000;
  const end = new Date(start.getTime() + durationMs);
  return { start, end };
}

function formatGoogleDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const h = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

function buildGoogleCalendarUrl(event, referenceDate = null) {
  const { start, end } = getEventStartEnd(event, referenceDate);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: (event.title || 'Evento Move Crew').replace(/&/g, ' and '),
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    details: (event.description || '').replace(/\n/g, '\n').substring(0, 1000),
    location: (event.zoomLink || '').substring(0, 500)
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildIcsContent(event, baseUrl, referenceDate = null) {
  const { start, end } = getEventStartEnd(event, referenceDate);
  const formatIcsDate = (date) => {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    const h = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    const s = String(date.getUTCSeconds()).padStart(2, '0');
    return `${y}${m}${d}T${h}${min}${s}Z`;
  };
  const escapeIcs = (str) => (str || '').replace(/\r/g, '').replace(/\n/g, '\\n').replace(/[,;\\]/g, '\\$&');
  const uid = `movecrew-${event._id}@${baseUrl || 'mformove.com'}`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Move Crew//Evento//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcs(event.title || 'Evento Move Crew')}`,
    `DESCRIPTION:${escapeIcs(event.description || '')} ${escapeIcs(event.zoomLink || '')}`,
    `LOCATION:${escapeIcs(event.zoomLink || '')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  return lines.join('\r\n');
}

/** GET: devuelve URLs para Google Calendar y Apple (ICS). Para eventos recurrentes (sin eventDate) se puede pasar ?date=YYYY-MM-DD para la ocurrencia a agregar. */
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

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date'); // YYYY-MM-DD para eventos recurrentes
    const referenceDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : null;

    const baseUrl = (process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/^https?:\/\//, '');
    const googleCalendarUrl = buildGoogleCalendarUrl(event, referenceDate);
    const icsContent = buildIcsContent(event, baseUrl, referenceDate);

    const icsQuery = referenceDate ? `?date=${encodeURIComponent(referenceDate)}` : '';
    return NextResponse.json({
      googleCalendarUrl,
      /** Para Apple: el front puede hacer GET a /api/move-crew-events/[id]/calendar/ics y usar el blob como .ics. Incluye ?date=YYYY-MM-DD si es recurrente. */
      icsUrl: `${process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || ''}/api/move-crew-events/${id}/calendar/ics${icsQuery}`
    });
  } catch (error) {
    console.error('Error generando URLs de calendario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al generar calendario' },
      { status: 500 }
    );
  }
}
