'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { routes } from '../../../constants/routes';
import {
  hubBlockTitle,
  hubBody,
  hubBodyMuted,
  hubEyebrow,
  hubMeta,
  hubMicroLabel,
  hubSectionTitle,
} from './courseHubTypography';

export type CourseHubComunidad = {
  whatsappGrupo: {
    url: string | null;
    titulo: string;
    descripcion: string;
    ctaTexto: string;
  };
  proximoEncuentro: {
    eventId: string;
    titulo: string;
    descripcion: string;
    zoomLink: string;
    fechaFormateada: string;
    horaFormateada: string;
    calendarUrl: string | null;
  } | null;
  contactoMateo: {
    url: string;
    titulo: string;
    descripcion: string;
    ctaTexto: string;
    mentoriaUrl: string;
  };
};

type Props = {
  comunidad: CourseHubComunidad;
};

const btnPrimaryClass =
  'inline-flex items-center justify-center rounded-full bg-palette-cream text-palette-ink border-2 border-palette-cream/80 font-montserrat font-semibold text-sm uppercase tracking-[0.12em] px-6 py-3 hover:bg-palette-sage hover:border-palette-sage transition-all duration-200';

const btnOutlineClass =
  'inline-flex items-center justify-center rounded-full border-2 border-palette-cream/55 text-palette-cream font-montserrat font-medium text-sm uppercase tracking-[0.1em] px-5 py-2.5 hover:bg-palette-cream/10 transition-all duration-200';

const itemMotion = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
};

export default function CourseContentHubCommunity({ comunidad }: Props) {
  const { whatsappGrupo, proximoEncuentro, contactoMateo } = comunidad;
  const [googleCalendarUrl, setGoogleCalendarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!proximoEncuentro?.calendarUrl) {
      setGoogleCalendarUrl(null);
      return;
    }
    let cancelled = false;
    fetch(proximoEncuentro.calendarUrl, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.googleCalendarUrl) {
          setGoogleCalendarUrl(data.googleCalendarUrl as string);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [proximoEncuentro?.calendarUrl]);

  return (
    <section className="mt-16 md:mt-24 max-w-3xl" aria-label="Comunidad y acompañamiento">
      <div className="mb-12 md:mb-16">
        <p className={`${hubEyebrow} mb-2`}>
          No estás solo en esto
        </p>
        <h2 className={`${hubSectionTitle} max-w-3xl`}>
          Comunidad, encuentros en vivo y contacto directo
        </h2>
      </div>

      <div className="space-y-14 md:space-y-16">
        {/* 1 · WhatsApp */}
        <motion.div {...itemMotion}>
          <p className={`${hubMicroLabel} mb-2`}>
            1 · Comunidad
          </p>
          <h3 className={`${hubBlockTitle} mb-3`}>
            {whatsappGrupo.titulo}
          </h3>
          <p className={`${hubBodyMuted} mb-5`}>
            {whatsappGrupo.descripcion}
          </p>
          {whatsappGrupo.url ? (
            <a
              href={whatsappGrupo.url}
              target="_blank"
              rel="noopener noreferrer"
              className={btnPrimaryClass}
            >
              {whatsappGrupo.ctaTexto}
            </a>
          ) : null}
        </motion.div>

        <div className="h-px bg-gradient-to-r from-palette-sage/40 via-palette-sage/15 to-transparent" aria-hidden />

        {/* 2 · Encuentro en vivo */}
        <motion.div {...itemMotion} transition={{ ...itemMotion.transition, delay: 0.05 }}>
          <p className={`${hubMicroLabel} mb-2`}>
            2 · En vivo
          </p>
          <h3 className={`${hubBlockTitle} mb-3`}>
            {proximoEncuentro?.titulo || 'Próximo encuentro en vivo'}
          </h3>
          <p className={`${hubBodyMuted} mb-4`}>
            {proximoEncuentro
              ? proximoEncuentro.descripcion ||
                'Q&A grupal con Mateo para dudas, correcciones y profundizar técnica.'
              : 'Los encuentros mensuales en vivo se anuncian en el grupo de WhatsApp. Te avisamos con fecha y hora.'}
          </p>
          {proximoEncuentro ? (
            <>
              <p className={`${hubBody} capitalize mb-1`}>
                {proximoEncuentro.fechaFormateada}
              </p>
              <p className={`${hubMeta} mb-6`}>
                {proximoEncuentro.horaFormateada} hs · Uruguay
              </p>
              <div className="flex flex-wrap gap-3">
                {googleCalendarUrl ? (
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={btnPrimaryClass}
                  >
                    Agregar al calendario
                  </a>
                ) : null}
                {proximoEncuentro.zoomLink ? (
                  <a
                    href={proximoEncuentro.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={btnOutlineClass}
                  >
                    Abrir Zoom
                  </a>
                ) : null}
              </div>
            </>
          ) : null}
        </motion.div>

        <div className="h-px bg-gradient-to-r from-palette-sage/40 via-palette-sage/15 to-transparent" aria-hidden />

        {/* 3 · Contacto Mateo */}
        <motion.div {...itemMotion} transition={{ ...itemMotion.transition, delay: 0.1 }}>
          <p className={`${hubMicroLabel} mb-2`}>
            3 · Contacto
          </p>
          <h3 className={`${hubBlockTitle} mb-3`}>
            {contactoMateo.titulo}
          </h3>
          <p className={`${hubBodyMuted} mb-5`}>
            {contactoMateo.descripcion}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {contactoMateo.url ? (
              <a
                href={contactoMateo.url}
                target="_blank"
                rel="noopener noreferrer"
                className={btnPrimaryClass}
              >
                {contactoMateo.ctaTexto}
              </a>
            ) : null}
            <Link
              href={contactoMateo.mentoriaUrl || routes.navegation.mentoria}
              className={btnOutlineClass}
            >
              Conocer la mentoría
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
