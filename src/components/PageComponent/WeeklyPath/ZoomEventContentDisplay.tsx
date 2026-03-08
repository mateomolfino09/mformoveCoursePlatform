'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  LinkIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
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
  title = 'Movimiento Online',
  description,
  zoomLink,
  eventDate,
  startTime,
  moveCrewEventId,
  onComplete,
  isCompleted,
}: Props) {
  const [calendarUrls, setCalendarUrls] = useState<{ googleCalendarUrl?: string; icsUrl?: string } | null>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showVerMas, setShowVerMas] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!moveCrewEventId) return;
    const dateParam = eventDate ? (typeof eventDate === 'string' && eventDate.length >= 10 ? eventDate.slice(0, 10) : null) : null;
    const url = dateParam
      ? `/api/move-crew-events/${moveCrewEventId}/calendar?date=${encodeURIComponent(dateParam)}`
      : `/api/move-crew-events/${moveCrewEventId}/calendar`;
    fetch(url, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setCalendarUrls({ googleCalendarUrl: data.googleCalendarUrl, icsUrl: data.icsUrl }))
      .catch(() => {});
  }, [moveCrewEventId, eventDate]);

  // Resetear expand al cambiar de evento/descripción
  useEffect(() => {
    setDescriptionExpanded(false);
    setShowVerMas(false);
  }, [description]);

  // Detectar si la descripción se corta en 2 líneas para mostrar "Ver más"
  useEffect(() => {
    if (!description || descriptionExpanded) return;
    const el = descriptionRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      if (el.scrollHeight > el.clientHeight) setShowVerMas(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [description, descriptionExpanded]);

  const formattedDate = eventDate
    ? (() => {
        const iso = eventDate.slice(0, 10);
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      })()
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-2xl text-center"
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
          <ComputerDesktopIcon className="w-5 h-5 sm:w-6 sm:h-6 text-palette-sage flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-palette-sage uppercase tracking-wider font-montserrat">
            Clase en vivo
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-palette-cream font-montserrat mb-2 sm:mb-3 px-1">
          {title}
        </h1>
        {description && (
          <div className="w-full max-w-xl text-center mb-4 sm:mb-5">
            <p
              ref={descriptionRef}
              className={`text-palette-cream/85 font-montserrat font-light leading-relaxed whitespace-pre-wrap text-xs sm:text-sm ${
                descriptionExpanded ? '' : 'line-clamp-2'
              }`}
            >
              {description}
            </p>
            {(showVerMas || descriptionExpanded) && (
              <button
                type="button"
                onClick={() => setDescriptionExpanded((e) => !e)}
                className="mt-1.5 inline-flex items-center gap-1 text-palette-sage font-montserrat text-xs font-medium hover:underline focus:outline-none mx-auto"
              >
                {descriptionExpanded ? (
                  <>
                    <ChevronUpIcon className="w-3.5 h-3.5" />
                    Ver menos
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="w-3.5 h-3.5" />
                    Ver más
                  </>
                )}
              </button>
            )}
          </div>
        )}
        {(formattedDate || startTime) && (
          <div className="flex items-center justify-center gap-2 text-palette-cream/90 font-montserrat text-sm sm:text-base mb-5 sm:mb-6 flex-wrap">
            <CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5 text-palette-stone flex-shrink-0" />
            <span>
              {formattedDate}
              {startTime && ` · ${startTime}`}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:flex-wrap sm:justify-center">
          {calendarUrls?.googleCalendarUrl && (
            <a
              href={calendarUrls.googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-[48px] sm:min-h-0 px-5 py-3.5 sm:py-3 border border-palette-stone/40 text-palette-cream font-montserrat font-medium rounded-xl hover:bg-palette-stone/20 transition-colors w-full sm:w-auto touch-manipulation"
            >
              <CalendarDaysIcon className="w-5 h-5 flex-shrink-0" />
              Agregar a Google Calendar
            </a>
          )}
          {calendarUrls?.icsUrl && (
            <a
              href={calendarUrls.icsUrl}
              download
              className="inline-flex items-center justify-center gap-2 min-h-[48px] sm:min-h-0 px-5 py-3.5 sm:py-3 border border-palette-stone/40 text-palette-cream font-montserrat font-medium rounded-xl hover:bg-palette-stone/20 transition-colors w-full sm:w-auto touch-manipulation"
            >
              <CalendarDaysIcon className="w-5 h-5 flex-shrink-0" />
              Agregar a Apple Calendar
            </a>
          )}
          {zoomLink && (
            <a
              href={zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-[48px] sm:min-h-0 px-5 py-3.5 sm:py-3 bg-palette-sage text-palette-ink font-montserrat font-medium rounded-xl hover:bg-palette-sage/90 transition-colors w-full sm:w-auto touch-manipulation"
            >
              <LinkIcon className="w-5 h-5 flex-shrink-0" />
              Unirse a Zoom
            </a>
          )}
        </div>

        {onComplete && (
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 w-full max-w-xl border-t border-palette-stone/10">
            {isCompleted ? (
              <p className="flex items-center justify-center gap-2 text-palette-sage font-montserrat text-sm">
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                Marcado como completado
              </p>
            ) : (
              <button
                type="button"
                onClick={onComplete}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-3 text-palette-cream border border-palette-cream/30 hover:bg-palette-cream/10 rounded-xl font-montserrat text-sm transition-colors w-full sm:w-auto touch-manipulation"
              >
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                Marcar como completado
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
