/**
 * Programa en Mandrill dos recordatorios por clase en vivo (zoomEvent): 1 hora antes y 15 minutos antes.
 * Del weekly logbook. Se llama al crear o actualizar el camino.
 * Al editar: primero se cancelan los recordatorios ya programados para este logbook.
 * Día 0 = primer martes del mes; cada contenido = martes + índice (0=martes, 1=miércoles, etc.).
 */

import MoveCrewEvent from '../models/moveCrewEventModel';
import Users from '../models/userModel';
import ScheduledZoomReminder from '../models/scheduledZoomReminderModel';
import { EmailService, EmailType } from '../services/email/emailService';

const URUGUAY_OFFSET = '-03:00';

function getFirstTuesdayOfMonth(y, m) {
  for (let d = 0; d < 7; d++) {
    const date = new Date(y, m - 1, 1 + d);
    if (date.getDay() === 2) return new Date(date.getTime());
  }
  return new Date(y, m - 1, 1);
}

function getTuesdayForWeek(y, m, weekNum) {
  const firstTue = getFirstTuesdayOfMonth(y, m);
  const result = new Date(firstTue);
  result.setDate(result.getDate() + (Math.max(1, Number(weekNum) || 1) - 1) * 7);
  return result;
}

/** Fecha (solo día) + startTime Uruguay → Date UTC */
function eventStartUtc(dateOnly, startTimeStr) {
  const y = dateOnly.getFullYear();
  const mo = String(dateOnly.getMonth() + 1).padStart(2, '0');
  const day = String(dateOnly.getDate()).padStart(2, '0');
  const [h, m] = (startTimeStr || '00:00').split(':').map(Number);
  const timeStr = `${String(h || 0).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}:00`;
  return new Date(`${y}-${mo}-${day}T${timeStr}${URUGUAY_OFFSET}`);
}

const COUNTRY_TO_TZ = {
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

/** Primera letra mayúscula, resto minúscula (para nombre en mails). */
function formatFirstName(s) {
  if (!s || typeof s !== 'string') return s || '';
  const t = s.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function getTimezoneForUser(user) {
  const c = (user.country || '').toString().trim().toLowerCase();
  if (!c) return 'America/Montevideo';
  const tz = COUNTRY_TO_TZ[c];
  if (tz) return tz;
  if (c.length === 2) return 'America/Montevideo';
  const byName = Object.entries(COUNTRY_TO_TZ).find(([k]) => k.includes(c) || c.includes(k));
  return byName ? byName[1] : 'America/Montevideo';
}

function formatEventInUserTz(eventStartUtcDate, userTimezone) {
  try {
    return {
      dateFormatted: eventStartUtcDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: userTimezone,
      }),
      timeFormatted: eventStartUtcDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: userTimezone,
      }),
    };
  } catch {
    return {
      dateFormatted: eventStartUtcDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      timeFormatted: eventStartUtcDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

/**
 * Cancela en Mandrill los recordatorios Zoom ya programados para este logbook (opcionalmente solo para ciertas semanas) y borra los registros.
 * @param {string} logbookId
 * @param {object} emailService
 * @param {number[]} [onlyWeekNumbers] - si se pasa, solo se cancelan los de esas semanas
 */
async function cancelExistingRemindersForLogbook(logbookId, emailService, onlyWeekNumbers = null) {
  const query = { logbookId };
  if (onlyWeekNumbers != null && Array.isArray(onlyWeekNumbers) && onlyWeekNumbers.length > 0) {
    query.weekNumber = { $in: onlyWeekNumbers };
  }
  const docs = await ScheduledZoomReminder.find(query).lean();
  for (const doc of docs) {
    if (doc.mandrillScheduledId) {
      await emailService.cancelScheduledEmail(doc.mandrillScheduledId);
    }
  }
  await ScheduledZoomReminder.deleteMany(query);
}

/**
 * Programa en Mandrill los recordatorios 1h antes para cada zoomEvent del logbook.
 * Antes programa: cancela los recordatorios previos de este logbook (por si se editó o se quitó un evento).
 * @param {object} logbook - Camino guardado (_id, month, year, weeklyContents). Si isBaseBitacora o sin month/year, no hace nada.
 * @param {object} [options] - onlyWeekNumbers: array de weekNumber; si se pasa, solo se programan eventos de esas semanas.
 * @returns {{ scheduled: number, errors: number, cancelled: number }}
 */
export async function scheduleMoveCrewRemindersForLogbook(logbook, options = {}) {
  if (!logbook) return { scheduled: 0, errors: 0, cancelled: 0 };
  if (logbook.isBaseBitacora) return { scheduled: 0, errors: 0, cancelled: 0 };
  const logbookYear = logbook.year != null ? Number(logbook.year) : null;
  const logbookMonth = logbook.month != null ? Number(logbook.month) : null;
  if (logbookYear == null || logbookMonth == null) return { scheduled: 0, errors: 0, cancelled: 0 };

  const weeklyContents = logbook.weeklyContents;
  const onlyWeekNumbers = options.onlyWeekNumbers && Array.isArray(options.onlyWeekNumbers) ? options.onlyWeekNumbers : null;

  if (!Array.isArray(weeklyContents) || weeklyContents.length === 0) {
    if (logbook._id) {
      const emailService = EmailService.getInstance();
      await cancelExistingRemindersForLogbook(logbook._id, emailService, onlyWeekNumbers);
    }
    return { scheduled: 0, errors: 0, cancelled: logbook._id ? 1 : 0 };
  }

  const emailService = EmailService.getInstance();
  const logbookId = logbook._id;

  if (logbookId) {
    await cancelExistingRemindersForLogbook(logbookId, emailService, onlyWeekNumbers);
  }

  const now = new Date();
  let scheduled = 0;
  let errors = 0;

  const members = await Users.find({
    $or: [{ 'subscription.active': true }, { isVip: true }],
  })
    .select('email name country validEmail')
    .lean();

  const sendAtIso = (d) => d.toISOString().replace(/\.\d{3}Z$/, 'Z');

  for (const week of weeklyContents) {
    const weekNum = Math.max(1, Number(week.weekNumber) || 1);
    if (onlyWeekNumbers != null && onlyWeekNumbers.length > 0 && !onlyWeekNumbers.includes(weekNum)) continue;
    const tuesdayOfWeek = getTuesdayForWeek(logbookYear, logbookMonth, weekNum);
    tuesdayOfWeek.setHours(0, 0, 0, 0);

    const contents = week.contents;
    if (!Array.isArray(contents)) continue;

    for (let i = 0; i < contents.length; i++) {
      const item = contents[i];
      if (item.contentType !== 'zoomEvent' || !item.moveCrewEventId) continue;

      const event = await MoveCrewEvent.findById(item.moveCrewEventId).lean();
      if (!event || !event.startTime) continue;

      const eventDate = new Date(tuesdayOfWeek);
      eventDate.setDate(eventDate.getDate() + i);
      const startUtc = eventStartUtc(eventDate, event.startTime);
      const sendAt1h = new Date(startUtc.getTime() - 60 * 60 * 1000);
      const sendAt15m = new Date(startUtc.getTime() - 15 * 60 * 1000);

      const nowPlus2Min = now.getTime() + 2 * 60 * 1000;
      const schedule1h = sendAt1h.getTime() > nowPlus2Min;
      const schedule15m = sendAt15m.getTime() > nowPlus2Min;
      if (!schedule1h && !schedule15m) continue;

      const ev = event;
      for (const usuario of members) {
        if (!usuario.email || usuario.validEmail !== 'yes') continue;
        const userTz = getTimezoneForUser(usuario);
        const { dateFormatted, timeFormatted } = formatEventInUserTz(startUtc, userTz);
        const fullName = (usuario.name || 'Miembro').toString().trim();
        const firstName = formatFirstName(fullName.split(/\s+/)[0] || fullName);
        const baseData = {
          name: firstName,
          eventTitle: ev.title,
          eventDateFormatted: dateFormatted,
          eventTime: timeFormatted,
          eventDescription: ev.description,
          zoomLink: ev.zoomLink,
        };

        if (schedule1h) {
          try {
            const result = await emailService.sendEmail({
              type: EmailType.MOVE_CREW_EVENT_REMINDER,
              to: usuario.email,
              subject: `Recordatorio: Clase en una hora`,
              data: baseData,
              sendAt: sendAtIso(sendAt1h),
            });
            if (result?.success && result?.scheduledId && logbookId) {
              await ScheduledZoomReminder.create({
                logbookId,
                mandrillScheduledId: result.scheduledId,
                email: usuario.email,
                weekNumber: weekNum,
                contentIndex: i,
                minutesBefore: 60,
              });
            }
            scheduled++;
          } catch (err) {
            console.error('[scheduleMoveCrewReminders] Error programando 1h para', usuario.email, err);
            errors++;
          }
        }

        if (schedule15m) {
          try {
            const result = await emailService.sendEmail({
              type: EmailType.MOVE_CREW_EVENT_REMINDER_15M,
              to: usuario.email,
              subject: `Empezamos en 15 - ${ev.title || 'Clase en vivo'}`,
              data: baseData,
              sendAt: sendAtIso(sendAt15m),
            });
            if (result?.success && result?.scheduledId && logbookId) {
              await ScheduledZoomReminder.create({
                logbookId,
                mandrillScheduledId: result.scheduledId,
                email: usuario.email,
                weekNumber: weekNum,
                contentIndex: i,
                minutesBefore: 15,
              });
            }
            scheduled++;
          } catch (err) {
            console.error('[scheduleMoveCrewReminders] Error programando 15m para', usuario.email, err);
            errors++;
          }
        }
      }
    }
  }

  return { scheduled, errors, cancelled: logbookId ? 1 : 0 };
}
