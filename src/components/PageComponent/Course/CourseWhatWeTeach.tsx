'use client';

import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import {
  PiBookOpenLight,
  PiMonitorPlayLight,
  PiMicrophoneStageLight,
  PiUsersThreeLight,
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
} as const;

const iconShell =
  'bg-gradient-to-br from-palette-ink to-[#2a2a22] text-palette-cream shadow-[0_12px_26px_-12px_rgba(20,20,17,0.75),inset_0_1px_0_rgba(255,255,255,0.1)]';

const offerCardShell =
  'group/offer-card relative isolate flex min-h-[12.5rem] cursor-default flex-col items-center gap-3 overflow-hidden rounded-2xl border border-palette-cream/40 bg-palette-cream px-4 py-6 pt-8 text-center shadow-[0_14px_44px_-18px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,253,253,0.85)] ring-1 ring-palette-sage/15 transition-[transform,box-shadow,border-color,ring-color] duration-300 ease-out hover:-translate-y-1.5 hover:border-palette-sage/50 hover:shadow-[0_24px_54px_-20px_rgba(0,0,0,0.44),inset_0_1px_0_rgba(255,253,253,1)] hover:ring-palette-sage/35 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:min-h-[13rem] sm:px-5 sm:py-7 sm:pt-9 md:min-h-[14rem] md:rounded-[1.35rem] md:px-6 md:py-8 md:pt-10';

/** Ruido muy suave sobre fondo cream. */
const OFFER_CARD_NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

/** Grilla uniforme: todos los módulos con el mismo peso visual. */
const modulesGridClass =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6';

function ModuleNumberWatermark({ step }: { step: number }) {
  const num = step.toString().padStart(2, '0');

  return (
    <span
      className="pointer-events-none absolute right-2 top-2 z-0 inline-block select-none px-2 py-1 font-montserrat text-[2.75rem] font-semibold tabular-nums leading-none text-palette-ink/[0.08] sm:right-3 sm:top-3 sm:text-[3.1rem] md:right-4 md:top-4 md:text-[3.5rem]"
      aria-hidden
    >
      {num}
    </span>
  );
}

export default function CourseWhatWeTeach() {
  const { cursoConfig } = useCursoLanding();
  const { queIncluye } = cursoConfig;
  const offerBlocks = queIncluye.offerBlocks.map((block) => ({
    lines: block.lineas,
    Icon: offerIconByKey[block.iconKey as keyof typeof offerIconByKey] || PiBookOpenLight,
    iconShell,
    hint: block.hint,
    highlightedLineIndex:
      typeof block.lineaDestacadaIndice === 'number' ? block.lineaDestacadaIndice : null,
  }));
  const modules = queIncluye.modulos.map((modulo) => ({
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

      <div className={`relative z-20 ${landingSectionContainer} text-center`}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-36px' }}
          className="mx-auto mb-10 max-w-4xl md:mb-12"
        >
          <h2
            id={`${queIncluye.anclaId}-heading`}
            className={landingSectionTitleDark}
          >
            {queIncluye.titulo}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          viewport={{ once: true }}
          className="mx-auto mb-14 max-w-7xl md:mb-16"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-4">
            {offerBlocks.map((block, i) => {
              const Icon = block.Icon;
              return (
                <div key={i} className={offerCardShell}>
                  <span
                    aria-hidden
                    className="absolute left-4 top-3.5 z-[2] font-montserrat text-[10px] font-semibold tabular-nums tracking-[0.22em] text-palette-stone/45 md:left-5 md:top-4"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[length:160px_160px] opacity-[0.035] mix-blend-multiply"
                    style={{ backgroundImage: OFFER_CARD_NOISE_BG }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-sage/35 to-transparent"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/55 via-transparent to-palette-sage/[0.1] opacity-90 transition-opacity duration-300 group-hover/offer-card:opacity-100"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-palette-sage/12 blur-2xl transition-all duration-500 group-hover/offer-card:bg-palette-sage/25 group-hover/offer-card:scale-125"
                  />
                  <div className="relative z-[1] mb-1">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -inset-2 rounded-[1.35rem] border border-palette-sage/25 transition-colors duration-300 group-hover/offer-card:border-palette-sage/45"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -inset-2 rounded-[1.35rem] bg-palette-sage/0 blur-md transition-colors duration-300 group-hover/offer-card:bg-palette-sage/20"
                    />
                    <div
                      className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 ease-out group-hover/offer-card:scale-[1.07] group-hover/offer-card:-rotate-2 motion-reduce:transition-none md:h-[4rem] md:w-[4rem] ${block.iconShell}`}
                      aria-hidden
                    >
                      <Icon className="h-8 w-8 text-palette-sage md:h-8 md:w-8" />
                    </div>
                  </div>
                  <div className="relative z-[1] flex flex-1 flex-col items-center justify-center gap-0.5">
                    {block.lines.map((line, j) => {
                      const isHighlighted =
                        block.highlightedLineIndex !== null && j === block.highlightedLineIndex;
                      if (isHighlighted) {
                        return (
                          <span
                            key={j}
                            className="mt-1 font-raleway text-[clamp(0.85rem,2.3vw,1.05rem)] font-semibold normal-case tracking-normal text-palette-teal"
                          >
                            {line}
                          </span>
                        );
                      }
                      return (
                        <span
                          key={j}
                          className={`font-montserrat font-bold uppercase tracking-[-0.02em] text-palette-ink ${
                            j === 0
                              ? 'text-[clamp(1rem,3.8vw,1.55rem)] leading-[1.15] md:text-[clamp(1.05rem,2vw,1.65rem)]'
                              : 'text-[clamp(0.88rem,3vw,1.25rem)] leading-tight md:text-[clamp(0.92rem,1.6vw,1.35rem)]'
                          }`}
                        >
                          {line}
                        </span>
                      );
                    })}
                  </div>
                  <div
                    aria-hidden
                    className="relative z-[1] my-1 h-px w-10 bg-gradient-to-r from-transparent via-palette-sage/40 to-transparent transition-[width] duration-300 group-hover/offer-card:w-16"
                  />
                  <p className="relative z-[1] max-w-[16rem] font-raleway text-[0.75rem] font-normal leading-snug text-palette-stone transition-colors duration-300 group-hover/offer-card:text-palette-ink/75 sm:text-[0.8rem] md:text-[0.875rem] md:leading-relaxed lg:max-w-[18rem] lg:text-[0.9375rem]">
                    {block.hint}
                  </p>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-center scale-x-0 bg-gradient-to-r from-palette-sage/0 via-palette-sage/55 to-palette-sage/0 transition-transform duration-300 ease-out group-hover/offer-card:scale-x-100"
                  />
                </div>
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
      <div className="mx-auto w-[92%] max-w-6xl px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-36px' }}
          className="mb-9 max-w-3xl md:mb-11"
        >
          <p className={landingEyebrow}>
            El recorrido
          </p>
          <h2 className={landingSectionTitle}>
            {modules.length} módulo{modules.length !== 1 ? 's' : ''} que se complementan entre sí
          </h2>
          <p className={landingSectionBody}>
            No son bloques sueltos: cada pieza ordena la siguiente. Podés avanzar en secuencia o volver al módulo que
            tu cuerpo necesita hoy.
          </p>
        </motion.div>

        <div className={modulesGridClass}>
          {modules.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{
                duration: 0.38,
                delay: Math.min(index * 0.03, 0.12),
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group/card relative flex h-full min-h-[20rem] flex-col overflow-hidden rounded-2xl border border-palette-stone/22 bg-gradient-to-br from-white/72 to-palette-cream/90 shadow-[0_6px_22px_rgba(20,20,17,0.05)] md:min-h-[22rem] md:rounded-3xl"
            >
              <div className="relative h-40 w-full shrink-0 overflow-hidden sm:h-44 md:h-48">
                <CldImage
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-[center_35%] transition-transform duration-[1.05s] ease-out group-hover/card:scale-[1.03]"
                  loader={imageLoader}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-palette-cream/95 via-palette-cream/25 to-transparent" />
              </div>
              <div className="relative flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
                <ModuleNumberWatermark step={index + 1} />
                <h3 className="relative z-[1] pr-14 font-semibold tracking-tight text-palette-ink text-[1.125rem] leading-snug sm:text-[1.2rem] md:pr-16 md:text-[1.3rem] md:leading-snug">
                  {item.title}
                </h3>
                <p className="relative z-[1] mt-3 text-[0.9375rem] font-light leading-[1.65] text-palette-ink/90 sm:text-[1rem] sm:leading-[1.68] md:mt-3.5 md:text-[1.0625rem] md:leading-[1.7]">
                  {item.line}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
