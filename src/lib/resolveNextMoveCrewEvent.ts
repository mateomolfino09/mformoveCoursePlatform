const URUGUAY_OFFSET = '-03:00';
const URUGUAY_TZ = 'America/Montevideo';

export type MoveCrewEventLike = {
  _id?: { toString(): string } | string;
  title?: string;
  description?: string;
  zoomLink?: string;
  eventDate?: Date | string | null;
  startTime?: string;
  durationMinutes?: number;
  repeatsWeekly?: boolean;
  weekday?: number | null;
};

export type NextMoveCrewEventOccurrence = {
  eventId: string;
  titulo: string;
  descripcion: string;
  zoomLink: string;
  fechaIso: string;
  startTime: string;
  fechaFormateada: string;
  horaFormateada: string;
};

function getTodayInUruguay(now = new Date()): {
  dateStr: string;
  year: number;
  month: number;
  day: number;
  weekday: number;
} {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: URUGUAY_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateStr = formatter.format(now);
  const [y, m, d] = dateStr.split('-').map(Number);
  const noonUruguayUtc = new Date(Date.UTC(y, m - 1, d, 12 + 3, 0, 0));
  const weekday = noonUruguayUtc.getUTCDay();
  return { dateStr, year: y, month: m, day: d, weekday };
}

function addDaysToDateStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function getEventStartUtc(
  event: MoveCrewEventLike,
  dateStr: string
): Date | null {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = (event.startTime || '00:00').split(':').map(Number);
  const timeStr = `${String(h || 0).padStart(2, '0')}:${String(min || 0).padStart(2, '0')}:00`;
  const start = new Date(
    `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${timeStr}${URUGUAY_OFFSET}`
  );
  return Number.isNaN(start.getTime()) ? null : start;
}

function formatOccurrence(startUtc: Date): { fechaFormateada: string; horaFormateada: string } {
  return {
    fechaFormateada: startUtc.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: URUGUAY_TZ,
    }),
    horaFormateada: startUtc.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: URUGUAY_TZ,
    }),
  };
}

function getNextOccurrenceForEvent(
  event: MoveCrewEventLike,
  now = new Date()
): { startUtc: Date; fechaIso: string } | null {
  const today = getTodayInUruguay(now);

  if (event.repeatsWeekly) {
    const targetWeekday = event.weekday;
    if (targetWeekday == null || targetWeekday < 0 || targetWeekday > 6) return null;

    for (let offset = 0; offset < 14; offset += 1) {
      const dateStr = addDaysToDateStr(today.dateStr, offset);
      const probe = getTodayInUruguay(new Date(`${dateStr}T15:00:00${URUGUAY_OFFSET}`));
      if (probe.weekday !== targetWeekday) continue;

      const startUtc = getEventStartUtc(event, dateStr);
      if (!startUtc || startUtc.getTime() <= now.getTime()) continue;

      return { startUtc, fechaIso: dateStr };
    }
    return null;
  }

  if (!event.eventDate) return null;
  const d = new Date(event.eventDate);
  if (Number.isNaN(d.getTime())) return null;
  const fechaIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const startUtc = getEventStartUtc(event, fechaIso);
  if (!startUtc || startUtc.getTime() <= now.getTime()) return null;
  return { startUtc, fechaIso };
}

export function resolveNextMoveCrewEventOccurrence(
  events: MoveCrewEventLike[],
  now = new Date()
): NextMoveCrewEventOccurrence | null {
  let best: (NextMoveCrewEventOccurrence & { startMs: number }) | null = null;

  for (const event of events) {
    const next = getNextOccurrenceForEvent(event, now);
    if (!next) continue;

    const { fechaFormateada, horaFormateada } = formatOccurrence(next.startUtc);
    const eventId =
      typeof event._id === 'string' ? event._id : event._id?.toString?.() || '';

    const candidate = {
      eventId,
      titulo: (event.title || 'Encuentro en vivo').trim(),
      descripcion: (event.description || '').trim(),
      zoomLink: (event.zoomLink || '').trim(),
      fechaIso: next.fechaIso,
      startTime: (event.startTime || '').trim(),
      fechaFormateada,
      horaFormateada,
      startMs: next.startUtc.getTime(),
    };

    if (!best || candidate.startMs < best.startMs) {
      best = candidate;
    }
  }

  if (!best) return null;
  const { startMs: _startMs, ...rest } = best;
  return rest;
}
