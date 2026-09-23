'use client';

import { motion } from 'framer-motion';
import {
  hubBlockTitle,
  hubBodyMuted,
  hubEyebrow,
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
  'inline-flex items-center justify-center rounded-full bg-palette-cream text-palette-ink border-2 border-palette-cream/80 font-montserrat font-semibold text-xs uppercase tracking-[0.1em] px-4 py-2 md:text-base md:tracking-[0.14em] md:px-8 md:py-3.5 hover:bg-palette-sage hover:border-palette-sage hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg';

export default function CourseContentHubCommunity({ comunidad }: Props) {
  const { whatsappGrupo } = comunidad;
  if (!whatsappGrupo?.url && !whatsappGrupo?.titulo) return null;

  return (
    <section className="max-w-2xl" aria-label="Comunidad">
      <div className="mb-6 md:mb-8">
        <p className={`${hubEyebrow} mb-2`}>Comunidad</p>
        <h2 className={`${hubSectionTitle} max-w-xl`}>Grupo de WhatsApp</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <h3 className={`${hubBlockTitle} mb-2`}>{whatsappGrupo.titulo}</h3>
        <p className={`${hubBodyMuted} mb-4`}>{whatsappGrupo.descripcion}</p>
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
    </section>
  );
}
