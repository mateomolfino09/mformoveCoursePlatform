import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import MoveCrewEvent from '../../../../models/moveCrewEventModel';
import Users from '../../../../models/userModel';
import { EmailService, EmailType } from '../../../../services/email/emailService';

export const dynamic = 'force-dynamic';

const URUGUAY_TZ = 'America/Montevideo';
const URUGUAY_OFFSET = '-03:00';

/** Fecha "hoy" en Uruguay (YYYY-MM-DD) y día de la semana (0=Dom, 1=Lun, ..., 6=Sab) */
function getTodayInUruguay(): { dateStr: string; year: number; month: number; day: number; weekday: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: URUGUAY_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateStr = formatter.format(new Date());
  const [y, m, d] = dateStr.split('-').map(Number);
  const noonUruguayUtc = new Date(Date.UTC(y, m - 1, d, 12 + 3, 0, 0));
  const weekday = noonUruguayUtc.getUTCDay();
  return { dateStr, year: y, month: m, day: d, weekday };
}

/** Evento en hora Uruguay: eventDate + startTime → Date UTC */
function getEventStartUtc(
  event: { eventDate: Date | string | null; startTime: string },
  dateStr?: string
): Date | null {
  const d = dateStr ? new Date(dateStr + 'T12:00:00Z') : new Date(event.eventDate as string);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const [h, m] = (event.startTime || '00:00').split(':').map(Number);
  const timeStr = `${String(h || 0).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}:00`;
  return new Date(`${y}-${mo}-${day}T${timeStr}${URUGUAY_OFFSET}`);
}

/** Compara si la fecha del evento (solo día) es igual a dateStr (YYYY-MM-DD) */
function isSameDate(eventDate: Date | string | null, dateStr: string): boolean {
  if (!eventDate) return false;
  const d = new Date(eventDate);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}` === dateStr;
}

/** Mapa país → IANA timezone para mostrar hora en el mail */
const COUNTRY_TO_TZ: Record<string, string> = {
  uruguay: 'America/Montevideo',
  uy: 'America/Montevideo',
  argentina: 'America/Argentina/Buenos_Aires',
  ar: 'America/Argentina/Buenos_Aires',
  españa: 'Europe/Madrid',
  spain: 'Europe/Madrid',
  es: 'Europe/Madrid',
  méxico: 'America/Mexico_City',
  mexico: 'America/Mexico_City',
  mx: 'America/Mexico_City',
  colombia: 'America/Bogota',
  co: 'America/Bogota',
  chile: 'America/Santiago',
  cl: 'America/Santiago',
  perú: 'America/Lima',
  peru: 'America/Lima',
  pe: 'America/Lima',
  brasil: 'America/Sao_Paulo',
  brazil: 'America/Sao_Paulo',
  br: 'America/Sao_Paulo',
  ecuador: 'America/Guayaquil',
  ec: 'America/Guayaquil',
  paraguay: 'America/Asuncion',
  py: 'America/Asuncion',
  bolivia: 'America/La_Paz',
  bo: 'America/La_Paz',
  venezuela: 'America/Caracas',
  ve: 'America/Caracas',
  'costa rica': 'America/Costa_Rica',
  cr: 'America/Costa_Rica',
  panamá: 'America/Panama',
  panama: 'America/Panama',
  pa: 'America/Panama',
};

function getTimezoneForUser(user: { country?: string }): string {
  const c = (user.country || '').toString().trim().toLowerCase();
  if (!c) return URUGUAY_TZ;
  const tz = COUNTRY_TO_TZ[c];
  if (tz) return tz;
  if (c.length === 2) return URUGUAY_TZ;
  const byName = Object.entries(COUNTRY_TO_TZ).find(([k]) => k.includes(c) || c.includes(k));
  return byName ? byName[1] : URUGUAY_TZ;
}

function formatEventInUserTz(
  eventStartUtc: Date,
  userTimezone: string
): { dateFormatted: string; timeFormatted: string } {
  try {
    const dateFormatted = eventStartUtc.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: userTimezone,
    });
    const timeFormatted = eventStartUtc.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: userTimezone,
    });
    return { dateFormatted, timeFormatted };
  } catch {
    return {
      dateFormatted: eventStartUtc.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      timeFormatted: eventStartUtc.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

/**
 * Cron que corre una vez al día: programa en Mandrill el recordatorio "1 hora antes"
 * para cada evento Move Crew que tenga sesión hoy (Uruguay).
 * Mandrill envía a la hora exacta (send_at); no hace falta un cron cada hora.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader =
      req.headers.get('x-cron-secret') ||
      req.headers.get('Authorization') ||
      req.headers.get('authorization');
    const tokenFromQuery = new URL(req.url).searchParams.get('token');
    const auth = tokenFromQuery ? `Bearer ${tokenFromQuery}` : authHeader;
    const expected = `Bearer ${process.env.CRON_SECRET}`;
    if (!auth || auth.trim() !== expected.trim()) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    const emailService = EmailService.getInstance();
    const { dateStr, weekday } = getTodayInUruguay();

    const events = await MoveCrewEvent.find().lean();
    const toSchedule: Array<{ event: (typeof events)[0]; startUtc: Date; sendAt: Date }> = [];

    for (const ev of events) {
      const e = ev as any;
      let eventStartUtc: Date | null = null;

      if (e.repeatsWeekly) {
        const eventWeekday = e.weekday != null ? Number(e.weekday) : null;
        if (eventWeekday === null) continue;
        if (eventWeekday !== weekday) continue;
        eventStartUtc = getEventStartUtc(e, dateStr);
      } else {
        if (!isSameDate(e.eventDate, dateStr)) continue;
        eventStartUtc = getEventStartUtc(e);
      }

      if (!eventStartUtc) continue;

      const sendAt = new Date(eventStartUtc.getTime() - 60 * 60 * 1000);
      const now = new Date();
      if (sendAt.getTime() <= now.getTime() + 2 * 60 * 1000) continue;
      toSchedule.push({ event: ev, startUtc: eventStartUtc, sendAt });
    }

    const miembrosActivos = await Users.find({
      $or: [{ 'subscription.active': true }, { isVip: true }],
    })
      .select('email name country validEmail')
      .lean();

    let scheduled = 0;
    const sendAtIso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, 'Z');

    for (const { event, startUtc, sendAt } of toSchedule) {
      const ev = event as any;
      for (const usuario of miembrosActivos) {
        if (!usuario.email || (usuario as any).validEmail !== 'yes') continue;
        const userTz = getTimezoneForUser(usuario as any);
        const { dateFormatted, timeFormatted } = formatEventInUserTz(startUtc, userTz);
        try {
          await emailService.sendEmail({
            type: EmailType.MOVE_CREW_EVENT_REMINDER,
            to: usuario.email,
            subject: `En 1 hora: ${ev.title || 'Clase en vivo Move Crew'}`,
            data: {
              name: usuario.name || 'Miembro',
              eventTitle: ev.title,
              eventDateFormatted: dateFormatted,
              eventTime: timeFormatted,
              eventDescription: ev.description,
              zoomLink: ev.zoomLink,
            },
            sendAt: sendAtIso(sendAt),
          });
          scheduled++;
        } catch (err) {
          console.error('[cron event-reminder] Error programando para', usuario.email, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      eventsScheduled: toSchedule.length,
      emailsScheduled: scheduled,
      message: 'Recordatorios programados en Mandrill (send_at) para hoy.',
    });
  } catch (error) {
    console.error('[cron event-reminder]', error);
    return NextResponse.json(
      { error: 'Error interno', details: (error as Error).message },
      { status: 500 }
    );
  }
}
