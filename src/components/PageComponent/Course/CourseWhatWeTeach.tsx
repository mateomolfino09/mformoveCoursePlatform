'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import {
  PiBookOpenLight,
  PiMonitorPlayLight,
  PiMicrophoneStageLight,
  PiUsersThreeLight,
  PiUsersFourLight,
  PiHeartbeatLight,
} from 'react-icons/pi';
import { useCursoLanding } from './CursoLandingContext';
import CourseDarkSectionBackground from './CourseDarkSectionBackground';
import {
  landingEyebrow,
  landingSectionBody,
  landingSectionContainer,
  landingSectionTitle,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';

const offerIconByKey = {
  book: PiBookOpenLight,
  video: PiMonitorPlayLight,
  live: PiMicrophoneStageLight,
  community: PiUsersThreeLight,
  experts: PiUsersFourLight,
  health: PiHeartbeatLight,
} as const;

const offerGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.08 },
  },
};

const offerCardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Grilla 2 columnas en desktop (módulos). */
const modulesGridClass = 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6';

export default function CourseWhatWeTeach() {
  const reduceMotion = useReducedMotion();
  const { cursoConfig } = useCursoLanding();
  const { queIncluye } = cursoConfig;

  const offerBlocks = queIncluye.offerBlocks.map((block, index) => ({
    step: String(index + 1).padStart(2, '0'),
    title: block.lineas.join(' '),
    hint: block.hint,
    Icon: offerIconByKey[block.iconKey as keyof typeof offerIconByKey] || PiBookOpenLight,
  }));

  const modules = queIncluye.modulos.map((modulo, index) => ({
    step: String(index + 1).padStart(2, '0'),
    title: modulo.titulo,
    line: modulo.descripcion,
    src: modulo.imagenPublicId,
  }));

  return (
    <>
      <section
        className="relative isolate overflow-hidden border-t border-white/10 bg-palette-ink py-16 font-montserrat md:py-20 lg:py-24"
        id={queIncluye.anclaId}
        aria-labelledby={`${queIncluye.anclaId}-heading`}
      >
        <CourseDarkSectionBackground />

        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
          <motion.div
            className="absolute -left-[10%] top-[12%] h-64 w-64 rounded-full bg-palette-sage/18 blur-[100px] md:h-80 md:w-80"
            animate={
              reduceMotion
                ? { opacity: 0.3 }
                : { x: [0, 40, -20, 0], y: [0, -24, 16, 0], opacity: [0.22, 0.38, 0.28, 0.22] }
            }
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -right-[6%] bottom-[10%] h-72 w-72 rounded-full bg-palette-cream/8 blur-[110px]"
            animate={
              reduceMotion
                ? { opacity: 0.2 }
                : { x: [0, -36, 18, 0], y: [0, 20, -12, 0], opacity: [0.14, 0.28, 0.18, 0.14] }
            }
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          />
        </div>

        <div className={`relative z-20 ${landingSectionContainer} text-center`}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-36px' }}
            className="mx-auto mb-10 max-w-4xl md:mb-14"
          >
            <h2 id={`${queIncluye.anclaId}-heading`} className={landingSectionTitleDark}>
              {queIncluye.titulo}
            </h2>
          </motion.div>

          <motion.div
            variants={offerGridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="mx-auto max-w-5xl"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6">
              {offerBlocks.map((block) => {
                const Icon = block.Icon;
                return (
                  <motion.article
                    key={block.step}
                    variants={offerCardVariants}
                    whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.22 } }}
                    className="group/offer-card relative flex min-h-[16rem] flex-col overflow-hidden rounded-2xl border border-palette-cream/20 bg-palette-ink/75 p-5 text-left shadow-[0_18px_50px_-26px_rgba(0,0,0,0.6)] backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:border-palette-sage/40 hover:shadow-[0_22px_56px_-22px_rgba(0,0,0,0.68)] md:min-h-0 md:flex-row md:items-start md:gap-6 md:p-7 md:rounded-[1.35rem]"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-palette-sage/8 via-transparent to-palette-cream/5"
                    />

                    <div className="relative z-[1] flex shrink-0 items-start gap-4 md:w-[7.5rem] md:flex-col md:gap-5">
                      <span
                        className="font-montserrat text-[1.75rem] font-semibold tabular-nums leading-none text-palette-cream/25 md:text-[2rem]"
                        aria-hidden
                      >
                        {block.step}
                      </span>
                      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-palette-sage/35 bg-palette-ink/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-transform duration-300 group-hover/offer-card:scale-[1.04] motion-reduce:transition-none md:h-14 md:w-14 md:rounded-2xl">
                        <Icon className="h-7 w-7 text-palette-sage" aria-hidden />
                      </span>
                    </div>

                    <div className="relative z-[1] mt-5 flex min-w-0 flex-1 flex-col md:mt-0">
                      <h3 className="font-montserrat text-[1.05rem] font-bold uppercase leading-[1.15] tracking-[0.03em] text-palette-cream sm:text-[1.125rem] md:text-[1.2rem] lg:text-[1.28rem]">
                        {block.title}
                      </h3>

                      <p className="mt-2.5 text-left text-[0.8125rem] font-normal leading-[1.42] text-palette-cream/75 md:mt-3 md:text-[0.875rem] md:leading-[1.44]">
                        {block.hint}
                      </p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section
        className="border-t border-palette-stone/20 bg-palette-cream font-montserrat py-16 md:py-24"
        aria-label="Módulos del programa"
      >
        <div className={`${landingSectionContainer} max-w-5xl`}>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-36px' }}
            className="mb-9 max-w-3xl md:mb-11"
          >
            <p className={landingEyebrow}>El recorrido</p>
            <h2 className={landingSectionTitle}>
              {modules.length} módulo{modules.length !== 1 ? 's' : ''} que se complementan entre sí
            </h2>
            <p className={`${landingSectionBody} !leading-[1.55] md:!leading-[1.58]`}>
              No son bloques sueltos: cada pieza ordena la siguiente. Podés avanzar en secuencia o
              volver al módulo que tu cuerpo necesita hoy.
            </p>
          </motion.div>

          <motion.div
            variants={offerGridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <div className={modulesGridClass}>
              {modules.map((item) => (
                <motion.article
                  key={item.title}
                  variants={offerCardVariants}
                  whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.22 } }}
                  className="group/module relative flex min-h-[15rem] flex-col overflow-hidden rounded-2xl border border-palette-stone/22 bg-white/90 p-5 text-left shadow-[0_14px_40px_-24px_rgba(20,20,17,0.1)] backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:border-palette-sage/40 hover:shadow-[0_18px_48px_-22px_rgba(20,20,17,0.14)] md:min-h-0 md:flex-row md:items-stretch md:gap-5 md:p-6 md:rounded-[1.35rem]"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-palette-sage/[0.06] via-transparent to-white/40"
                  />

                  <div className="relative z-[1] flex shrink-0 flex-col gap-3 md:w-[8.5rem] lg:w-[9.5rem]">
                    <span
                      className="font-montserrat text-[1.75rem] font-semibold tabular-nums leading-none text-palette-ink/15 md:text-[2rem]"
                      aria-hidden
                    >
                      {item.step}
                    </span>
                    <div className="relative h-28 w-full overflow-hidden rounded-xl border border-palette-stone/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] md:h-full md:min-h-[7.5rem] md:rounded-2xl">
                      <CldImage
                        src={item.src}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 180px"
                        className="object-cover object-[center_35%] transition-transform duration-500 ease-out group-hover/module:scale-[1.04]"
                        loader={imageLoader}
                      />
                    </div>
                  </div>

                  <div className="relative z-[1] mt-5 flex min-w-0 flex-1 flex-col md:mt-0 md:py-0.5">
                    <h3 className="font-montserrat text-[1.05rem] font-bold leading-[1.15] tracking-tight text-palette-ink sm:text-[1.125rem] md:text-[1.2rem] lg:text-[1.28rem]">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-[0.8125rem] font-normal leading-[1.42] text-palette-stone md:mt-3 md:text-[0.875rem] md:leading-[1.44]">
                      {item.line}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
