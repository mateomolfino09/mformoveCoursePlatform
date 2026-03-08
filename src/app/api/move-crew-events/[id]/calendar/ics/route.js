import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../../../../config/connectDB';
import MoveCrewEvent from '../../../../../../models/moveCrewEventModel';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const URUGUAY_OFFSET = '-03:00';

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

/** GET: devuelve el archivo .ics. Para recurrentes sin eventDate usar ?date=YYYY-MM-DD. */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('ID inválido', { status: 400 });
    }
    const event = await MoveCrewEvent.findById(id).lean();
    if (!event) {
      return new NextResponse('Evento no encontrado', { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const referenceDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : null;

    const baseUrl = (process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/^https?:\/\//, '');
    const icsContent = buildIcsContent(event, baseUrl, referenceDate);
    const filename = `evento-move-crew-${event._id}.ics`;

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error generando ICS:', error);
    return new NextResponse('Error al generar calendario', { status: 500 });
  }
}
