'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  LinkIcon,
  ComputerDesktopIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Props {
  title?: string;
  description?: string;
  zoomLink?: string;
  eventDate?: string;
  startTime?: string;
  moveCrewEventId?: string;
  onComplete?: () => void;
  isCompleted?: boolean;
  logbookId?: string;
  weekNumber?: number;
  contentIndex?: number;
}

export default function ZoomEventContentDisplay({
  title = 'Clase en vivo',
  description,
  zoomLink,
  eventDate,
  startTime,
  moveCrewEventId,
  onComplete,
  isCompleted,
}: Props) {
  const [calendarUrls, setCalendarUrls] = useState<{ googleCalendarUrl?: string; icsUrl?: string } | null>(null);

  useEffect(() => {
    if (!moveCrewEventId) return;
    fetch(`/api/move-crew-events/${moveCrewEventId}/calendar`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setCalendarUrls({ googleCalendarUrl: data.googleCalendarUrl, icsUrl: data.icsUrl }))
      .catch(() => {});
  }, [moveCrewEventId]);

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="w-full min-h-[60vh] max-w-3xl mx-auto px-4 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-palette-stone/20 bg-palette-ink/60 backdrop-blur-sm overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <ComputerDesktopIcon className="w-6 h-6 text-palette-sage" />
            <span className="text-sm font-medium text-palette-sage uppercase tracking-wider">Clase en vivo</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-palette-cream font-montserrat mb-4">{title}</h1>
          {description && (
            <p className="text-palette-cream/85 font-montserrat font-light text-base leading-relaxed mb-6 whitespace-pre-wrap">
              {description}
            </p>
          )}
          {(formattedDate || startTime) && (
            <div className="flex items-center gap-2 text-palette-cream/90 font-montserrat mb-6">
              <CalendarDaysIcon className="w-5 h-5 text-palette-stone" />
              <span>
                {formattedDate}
                {startTime && ` · ${startTime}`}
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            {zoomLink && (
              <a
                href={zoomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-palette-sage text-palette-ink font-montserrat font-medium rounded-xl hover:bg-palette-sage/90 transition-colors"
              >
                <LinkIcon className="w-5 h-5" />
                Unirse a Zoom
              </a>
            )}
            {calendarUrls?.googleCalendarUrl && (
              <a
                href={calendarUrls.googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-palette-stone/40 text-palette-cream font-montserrat font-medium rounded-xl hover:bg-palette-stone/20 transition-colors"
              >
                <CalendarDaysIcon className="w-5 h-5" />
                Agregar a Google Calendar
              </a>
            )}
            {calendarUrls?.icsUrl && (
              <a
                href={calendarUrls.icsUrl}
                download
                className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-palette-stone/40 text-palette-cream font-montserrat font-medium rounded-xl hover:bg-palette-stone/20 transition-colors"
              >
                <CalendarDaysIcon className="w-5 h-5" />
                Agregar a Apple Calendar
              </a>
            )}
          </div>

          {onComplete && (
            <div className="mt-8 pt-6 border-t border-palette-stone/20">
              {isCompleted ? (
                <p className="flex items-center gap-2 text-palette-sage font-montserrat text-sm">
                  <CheckCircleIcon className="w-5 h-5" />
                  Marcado como completado
                </p>
              ) : (
                <button
                  type="button"
                  onClick={onComplete}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-palette-cream border border-palette-cream/30 hover:bg-palette-cream/10 rounded-xl font-montserrat text-sm transition-colors"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Marcar como completado
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
