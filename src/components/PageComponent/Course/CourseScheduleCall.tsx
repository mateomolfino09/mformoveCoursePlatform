'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import CourseDarkSectionBackground from './CourseDarkSectionBackground';
import {
  landingCtaInvertedCompact,
  landingCardBodyDark,
  landingSectionContainer,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';
import { resolveCloudinaryOrHttpUrl } from '../../../lib/resolveMediaImageUrl';
import { useCursoLanding } from './CursoLandingContext';
import {
  CURSO_SALES_CALL_BOOKING_URL,
  CURSO_SALES_CALL_DURATION_MIN,
  CURSO_SALES_CALL_HOST,
  cursoSalesCallCtaLabel,
} from '../../../constants/cursoSalesCall';

function resolveHostPhoto(rawSrc: string) {
  const trimmed = rawSrc.trim();
  if (!trimmed) {
    return { kind: 'initials' as const };
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return { kind: 'external' as const, src: trimmed };
  }
  return {
    kind: 'cloudinary' as const,
    publicId: trimmed,
    src: resolveCloudinaryOrHttpUrl(trimmed),
  };
}

function initialsOf(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || '?';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function CourseScheduleCall() {
  const reduceMotion = useReducedMotion();
  const { productName } = useCursoLanding();
  const hostPhoto = resolveHostPhoto(CURSO_SALES_CALL_HOST.imageSrc);

  return (
    <section
      className="relative isolate overflow-hidden border-t border-palette-stone/30 bg-palette-ink py-16 font-montserrat md:py-20"
      aria-labelledby="course-schedule-call-heading"
    >
      <CourseDarkSectionBackground />

      {/* Orbes extra sobre el fondo compartido */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
        <motion.div
          className="absolute -left-[12%] top-[18%] h-56 w-56 rounded-full bg-palette-sage/20 blur-[90px] md:h-72 md:w-72"
          animate={
            reduceMotion
              ? { opacity: 0.35 }
              : { x: [0, 36, -18, 0], y: [0, -28, 14, 0], opacity: [0.28, 0.42, 0.32, 0.28] }
          }
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-[8%] bottom-[8%] h-64 w-64 rounded-full bg-palette-cream/10 blur-[100px] md:h-80 md:w-80"
          animate={
            reduceMotion
              ? { opacity: 0.25 }
              : { x: [0, -32, 20, 0], y: [0, 22, -16, 0], opacity: [0.18, 0.32, 0.22, 0.18] }
          }
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        />
      </div>

      <div className={`relative z-10 ${landingSectionContainer}`}>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-60px' }}
          className="relative mx-auto max-w-3xl overflow-hidden rounded-[1.75rem] border border-palette-cream/15 bg-palette-ink/72 shadow-[0_28px_80px_-32px_rgba(0,0,0,0.75)] backdrop-blur-xl md:rounded-[2rem]"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-palette-sage/12 via-transparent to-palette-cream/8"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[min(100%,28rem)] -translate-x-1/2 rounded-full bg-palette-sage/25 blur-3xl"
            aria-hidden
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="relative px-6 py-10 text-center md:px-12 md:py-14"
          >
            <motion.div variants={itemVariants} className="mb-4 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-palette-sage/40 bg-palette-sage/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-palette-cream/90 backdrop-blur-sm">
                <motion.span
                  className="relative flex h-2 w-2"
                  animate={reduceMotion ? undefined : { scale: [1, 1.35, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="absolute inline-flex h-full w-full rounded-full bg-palette-sage opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-palette-sage" />
                </motion.span>
                ¿Todavía tenés dudas?
              </span>
            </motion.div>

            <motion.h2
              id="course-schedule-call-heading"
              variants={itemVariants}
              className={`${landingSectionTitleDark} mx-auto max-w-2xl !mt-0`}
            >
              Hablemos antes de que decidas
            </motion.h2>

            <motion.div
              variants={itemVariants}
              className="mx-auto mt-5 max-w-2xl space-y-4 text-left md:text-center"
            >
              <p className={landingCardBodyDark}>
                Si querés entender mejor cómo funciona Cuerpo Autónomo, saber si es para vos o
                simplemente charlar sobre lo que estás buscando, podés agendar una videollamada con
                alguien del equipo.
              </p>
              <p className={landingCardBodyDark}>
                Son {CURSO_SALES_CALL_DURATION_MIN} minutos, sin compromiso. La idea es conocerte,
                responder tus dudas y ver si este programa tiene sentido para vos.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mx-auto mt-8 max-w-xl text-left md:max-w-2xl"
            >
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-palette-cream/12 bg-palette-ink/45 p-5 backdrop-blur-sm md:flex-row md:items-start md:gap-5 md:p-6">
                <div className="relative flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-palette-sage/35 bg-palette-sage/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:h-[4.75rem] md:w-[4.75rem]">
                  {hostPhoto.kind === 'cloudinary' ? (
                    <CldImage
                      src={hostPhoto.publicId}
                      alt={`Foto de ${CURSO_SALES_CALL_HOST.name}`}
                      fill
                      sizes="76px"
                      className="object-cover object-center"
                      loader={imageLoader}
                    />
                  ) : hostPhoto.kind === 'external' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={hostPhoto.src}
                      alt={`Foto de ${CURSO_SALES_CALL_HOST.name}`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="font-montserrat text-lg font-semibold text-palette-sage md:text-xl"
                    >
                      {initialsOf(CURSO_SALES_CALL_HOST.name)}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1 text-center md:text-left">
                  <p className="font-montserrat text-base font-semibold tracking-tight text-palette-cream md:text-[1.05rem]">
                    {CURSO_SALES_CALL_HOST.name}
                  </p>
                  <p className="mt-1 text-sm font-normal leading-snug text-palette-cream/75">
                    {CURSO_SALES_CALL_HOST.roleLine}
                  </p>
                  <blockquote className="mt-3 border-0 p-0 text-[0.8125rem] font-normal not-italic leading-[1.48] text-palette-cream/70 md:text-[0.875rem] md:leading-[1.5]">
                    <span aria-hidden className="text-palette-cream/45">
                      «
                    </span>
                    {CURSO_SALES_CALL_HOST.bio}
                    <span aria-hidden className="text-palette-cream/45">
                      »
                    </span>
                  </blockquote>
                </div>
              </div>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="mt-7 text-sm font-semibold tracking-wide text-palette-cream/90"
            >
              {CURSO_SALES_CALL_DURATION_MIN} min · Videollamada · Sin costo
            </motion.p>

            <motion.div variants={itemVariants} className="mt-9 flex justify-center">
              <motion.a
                href={CURSO_SALES_CALL_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${landingCtaInvertedCompact} relative w-full overflow-hidden sm:w-auto`}
                whileHover={reduceMotion ? undefined : { scale: 1.03, y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              >
                <motion.span
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                  animate={reduceMotion ? undefined : { x: ['-120%', '220%'] }}
                  transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
                  aria-hidden
                />
                <span className="relative z-[1]">{cursoSalesCallCtaLabel(productName)}</span>
                <span className="relative z-[1] transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </motion.a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
