import MoveCrewEvent from '../models/moveCrewEventModel';
import { routes } from '../constants/routes';
import { resolveNextMoveCrewEventOccurrence } from './resolveNextMoveCrewEvent';
import { normalizeCursoLandingConfig } from '../types/cursoLanding';
import { resolveInvitacionGrupoWhatsappFromProduct } from './resolveInvitacionGrupoWhatsapp';

const URUGUAY_OFFSET = '-03:00';

function getEventStartEnd(
  event: {
    eventDate?: Date | string | null;
    startTime?: string;
    durationMinutes?: number;
  },
  referenceDate?: string | null
) {
  const d = event.eventDate
    ? new Date(event.eventDate)
    : referenceDate
      ? new Date(`${referenceDate}T12:00:00Z`)
      : new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const [h, m] = (event.startTime || '00:00').split(':').map(Number);
  const timeStr = `${String(h || 0).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}:00`;
  const start = new Date(`${y}-${mo}-${day}T${timeStr}${URUGUAY_OFFSET}`);
  const durationMs = (event.durationMinutes || 60) * 60 * 1000;
  return { start, end: new Date(start.getTime() + durationMs) };
}

function formatGoogleDate(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const h = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

function buildGoogleCalendarUrl(
  event: { title?: string; description?: string; zoomLink?: string; eventDate?: Date | string | null; startTime?: string; durationMinutes?: number },
  referenceDate?: string | null
) {
  const { start, end } = getEventStartEnd(event, referenceDate);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: (event.title || 'Encuentro en vivo').replace(/&/g, ' and '),
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    details: (event.description || '').substring(0, 1000),
    location: (event.zoomLink || '').substring(0, 500),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export type CourseWelcomeEmailCommunity = {
  whatsappInviteUrl?: string;
  mateoWhatsappUrl?: string;
  mentoriaUrl: string;
  proximoEncuentro?: {
    titulo: string;
    fechaFormateada: string;
    horaFormateada: string;
    zoomLink?: string;
    googleCalendarUrl?: string;
  };
};

export async function resolveCourseWelcomeEmailCommunity(
  product: {
    nombre?: string;
    name?: string;
    descripcion?: string;
    cursoConfig?: unknown;
    invitacionGrupoWhatsapp?: string;
    grupoWhatsapp?: string;
    programaTransformacional?: unknown;
  }
): Promise<CourseWelcomeEmailCommunity> {
  const courseName = product.nombre || product.name || 'Curso';
  const cursoConfig = normalizeCursoLandingConfig(
    product.cursoConfig as Parameters<typeof normalizeCursoLandingConfig>[0],
    courseName
  );
  const whatsappInviteUrl = resolveInvitacionGrupoWhatsappFromProduct(product) || undefined;
  const mateoWhatsappUrl = cursoConfig.whatsapp?.enlace?.trim() || undefined;
  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'https://mateomove.com';
  const mentoriaUrl = `${origin.replace(/\/$/, '')}${routes.navegation.mentoria}`;

  const events = await MoveCrewEvent.find().lean();
  const next = resolveNextMoveCrewEventOccurrence(events);
  let proximoEncuentro: CourseWelcomeEmailCommunity['proximoEncuentro'];

  if (next) {
    const rawEvent = events.find(
      (ev) => String(ev._id) === next.eventId
    );
    proximoEncuentro = {
      titulo: next.titulo,
      fechaFormateada: next.fechaFormateada,
      horaFormateada: next.horaFormateada,
      zoomLink: next.zoomLink || undefined,
      googleCalendarUrl: rawEvent
        ? buildGoogleCalendarUrl(rawEvent as Parameters<typeof buildGoogleCalendarUrl>[0], next.fechaIso)
        : undefined,
    };
  }

  return {
    whatsappInviteUrl,
    mateoWhatsappUrl,
    mentoriaUrl,
    proximoEncuentro,
  };
}
