'use client';

import { motion, useReducedMotion } from 'framer-motion';
import CourseDarkSectionBackground from './CourseDarkSectionBackground';
import {
  landingCtaInverted,
  landingCardBodyDark,
  landingSectionContainer,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';
import { CURSO_SALES_CALL_BOOKING_URL } from '../../../constants/cursoSalesCall';

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
                    simplemente charlar sobre lo que estás buscando, podés agendar una llamada conmigo.
                  </p>
                  <p className={landingCardBodyDark}>
                    Son 20 minutos, sin compromiso. Te escucho, respondo tus preguntas y vemos juntos
                    si este programa tiene sentido para vos.
                  </p>
                </motion.div>

                <motion.p
                  variants={itemVariants}
                  className="mt-7 text-sm font-semibold tracking-wide text-palette-cream/90"
                >
                  20 min · Videollamada · Sin costo
                </motion.p>

                <motion.div variants={itemVariants} className="mt-9 flex justify-center">
                  <motion.a
                    href={CURSO_SALES_CALL_BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${landingCtaInverted} relative w-full overflow-hidden sm:w-auto`}
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
                    <span className="relative z-[1]">Agendar una llamada</span>
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
