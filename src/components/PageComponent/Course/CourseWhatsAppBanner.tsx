'use client';

import { motion } from 'framer-motion';
import { useCursoLanding } from './CursoLandingContext';
import CourseDarkSectionBackground from './CourseDarkSectionBackground';
import {
  landingSectionContainer,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';

const HABLAR_CONMIGO_SVG = '/images/svg/FondoHablarConmigoMobile.svg';

export default function CourseWhatsAppBanner() {
  const { cursoConfig } = useCursoLanding();
  const { whatsapp } = cursoConfig;

  return (
    <section
      aria-label="Contacto por WhatsApp"
      className="relative isolate overflow-hidden border-t border-white/10 bg-palette-ink font-montserrat"
    >
      <CourseDarkSectionBackground />

      <div
        className={`relative z-20 flex min-h-[min(118vw,26rem)] flex-col pt-10 sm:min-h-[min(90vw,30rem)] sm:pt-12 md:min-h-[min(52vh,38rem)] md:flex-row md:items-stretch md:pt-16 lg:min-h-[min(56vh,42rem)] ${landingSectionContainer}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-48px' }}
          className="relative z-10 flex w-full shrink-0 flex-col items-center justify-center px-1 text-center md:w-[30%] md:items-start md:pr-6 md:text-left lg:pr-8 "
        >
          <h2
            className={`${landingSectionTitleDark} max-w-[11ch] text-balance text-start text-[1.85rem] leading-[1.12] sm:text-[2.15rem] md:max-w-[12ch] md:text-[2.85rem] lg:text-[3.65rem] `}
          >
            {whatsapp.titulo}
          </h2>

          <div className="mt-6 flex w-full justify-center sm:mt-8 md:mt-10">
            <a
              href={whatsapp.enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full max-w-xs items-center justify-center rounded-full border-2 border-palette-cream/80 bg-palette-cream px-6 py-3.5 text-center font-montserrat text-[11px] font-semibold uppercase tracking-[0.16em] text-palette-ink transition-all duration-200 hover:border-white hover:bg-white sm:w-auto sm:px-7 sm:text-sm sm:tracking-[0.2em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-palette-sage/55 focus-visible:ring-offset-2 focus-visible:ring-offset-palette-ink"
            >
              {whatsapp.ctaTexto}
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-36px' }}
          className="relative mt-6 min-h-[11.5rem] flex-1 sm:mt-8 sm:min-h-[14rem] md:mt-0 md:min-h-0 md:w-[70%]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HABLAR_CONMIGO_SVG}
            alt=""
            className="absolute bottom-0 left-[30%] h-auto w-[min(128%,22rem)] max-w-none -translate-x-1/2 opacity-100 sm:w-[min(118%,28rem)] md:left-auto md:right-[10%] md:w-[118%] md:translate-x-0 lg:right-[22%] lg:w-[105%]"
          />
        </motion.div>
      </div>
    </section>
  );
}
