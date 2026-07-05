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
import { sectionMainTitle } from './courseSectionTitle';

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

const padX = 'w-[90%] max-w-7xl mx-auto px-4 sm:px-5';

/** Grilla bento 12 cols — mismo ritmo que MentorshipProcess (5 módulos). */
const moduleBentoGridClass: Record<number, string> = {
  0: 'md:col-span-8 md:row-span-2 md:row-start-1 md:col-start-1 md:min-h-[280px]',
  1: 'md:col-span-4 md:row-start-1 md:col-start-9',
  2: 'md:col-span-4 md:row-start-2 md:col-start-9',
  3: 'md:col-span-6 md:row-start-3 md:col-start-1',
  4: 'md:col-span-6 md:row-start-3 md:col-start-7',
};

function ModuleNumberWatermark({
  step,
  size = 'default',
}: {
  step: number;
  size?: 'hero' | 'default' | 'band';
}) {
  const num = step.toString().padStart(2, '0');
  const numberClass =
    size === 'hero'
      ? 'text-[3.25rem] sm:text-[3.75rem] md:text-[4.5rem] px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5'
      : size === 'band'
        ? 'text-[2.75rem] sm:text-[3.1rem] px-2 py-1 sm:px-3 sm:py-1.5'
        : 'text-[2.85rem] sm:text-[3.35rem] px-2 py-1 sm:px-3 sm:py-1.5';

  return (
    <span
      className={`pointer-events-none absolute right-1 top-1 z-0 inline-block select-none font-montserrat font-semibold tabular-nums leading-none text-palette-ink/[0.075] sm:right-2 sm:top-2 md:right-3 md:top-3 ${numberClass}`}
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
      className="mc-curso-dark-section py-16 md:py-20 lg:py-24"
      id={queIncluye.anclaId}
      aria-labelledby={`${queIncluye.anclaId}-heading`}
    >
      <div
        className="pointer-events-none absolute -right-[10%] top-[-15%] h-[min(380px,48vw)] w-[min(380px,65vw)] rounded-full bg-palette-sage/10 blur-[100px]"
        aria-hidden
      />

      <div className={`relative ${padX} text-center`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mx-auto mb-10 max-w-4xl md:mb-12"
        >
          <h2
            id={`${queIncluye.anclaId}-heading`}
            className={`mc-text-ink-shadow-title ${sectionMainTitle} text-palette-cream`}
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-palette-ink">
            El recorrido
          </p>
          <h2 className="mt-3 text-[1.85rem] font-bold leading-[1.1] tracking-tight text-palette-ink md:text-[2.25rem] md:leading-[1.08] lg:text-[2.5rem]">
            {modules.length} módulo{modules.length !== 1 ? 's' : ''} que se complementan entre sí
          </h2>
          <p className="mt-5 text-[15px] font-normal leading-[1.72] text-palette-ink md:text-[16px]">
            No son bloques sueltos: cada pieza ordena la siguiente. Podés avanzar en secuencia o volver al módulo que
            tu cuerpo necesita hoy.
          </p>
        </motion.div>

        <div
          className="-mx-3 flex gap-3 overflow-x-auto overflow-y-visible px-3 pb-2 pt-1 snap-x snap-mandatory scrollbar-thin sm:-mx-4 sm:px-4 md:mx-0 md:grid md:grid-cols-12 md:gap-4 md:overflow-visible md:px-0 md:pb-0 md:snap-none md:auto-rows-min"
          style={{ scrollbarGutter: 'stable' }}
        >
          {modules.map((item, index) => {
            const isHero = index === 0;
            const hasBand = index === modules.length - 1 && modules.length >= 5;
            const bentoClass = moduleBentoGridClass[index] ?? 'md:col-span-6';

            return (
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
                className={`group/card relative shrink-0 snap-center overflow-hidden rounded-2xl border border-palette-stone/22 bg-gradient-to-br from-white/72 to-palette-cream/90 shadow-[0_6px_22px_rgba(20,20,17,0.05)] min-w-[min(100vw-1.75rem,300px)] w-[min(100vw-1.75rem,300px)] md:w-auto md:min-w-0 ${bentoClass} ${isHero ? 'p-0 md:flex md:flex-row' : hasBand ? 'flex flex-col p-0' : 'p-4 sm:p-5'}`}
              >
                {isHero ? (
                  <>
                    <div className="relative aspect-[16/11] shrink-0 overflow-hidden sm:aspect-[5/4] md:aspect-auto md:w-[44%] md:min-h-[260px]">
                      <CldImage
                        src={item.src}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 90vw, 36vw"
                        className="object-cover object-[center_22%] transition-transform duration-[1.15s] ease-out group-hover/card:scale-[1.035]"
                        loader={imageLoader}
                        preserveTransformations
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-palette-ink/35 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-palette-cream/15" />
                    </div>
                    <div className="relative flex min-w-0 flex-1 flex-col p-4 pr-[4.75rem] sm:p-5 sm:pr-[5.25rem] md:justify-center md:p-6 md:pr-24">
                      <ModuleNumberWatermark step={index + 1} size="hero" />
                      <h3 className="relative z-[1] font-semibold text-palette-ink text-[17px] leading-snug tracking-tight md:text-lg">
                        {item.title}
                      </h3>
                      <p className="relative z-[1] mt-2 text-[13px] font-light leading-[1.6] text-palette-ink opacity-90 md:text-[14px]">
                        {item.line}
                      </p>
                    </div>
                  </>
                ) : hasBand ? (
                  <>
                    <div className="relative h-[100px] w-full shrink-0 overflow-hidden sm:h-[112px]">
                      <CldImage
                        src={item.src}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 45vw"
                        className="object-cover object-[center_40%] transition-transform duration-[1.05s] ease-out group-hover/card:scale-[1.03]"
                        loader={imageLoader}
                        preserveTransformations
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-palette-cream/90 via-palette-cream/20 to-transparent" />
                    </div>
                    <div className="relative flex flex-col px-4 pb-4 pt-4 pr-[3.5rem] sm:px-5 sm:pb-5 sm:pr-16 sm:pt-5 md:pr-[7rem]">
                      <ModuleNumberWatermark step={index + 1} size="band" />
                      <h3 className="relative z-[1] font-semibold text-palette-ink text-[15px] leading-snug tracking-tight md:text-[16px]">
                        {item.title}
                      </h3>
                      <p className="relative z-[1] mt-2 text-[12px] font-light leading-[1.58] text-palette-ink opacity-90 md:text-[13px]">
                        {item.line}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="relative z-[1] flex min-h-0 flex-1 flex-col pr-[3.25rem] sm:pr-16 md:pr-[7rem]">
                    <ModuleNumberWatermark step={index + 1} size="default" />
                    <h3 className="relative z-[1] font-semibold text-palette-ink text-[15px] leading-snug tracking-tight md:text-[16px]">
                      {item.title}
                    </h3>
                    <p className="relative z-[1] mt-2 text-[12px] font-light leading-[1.58] text-palette-ink opacity-90 md:text-[13px]">
                      {item.line}
                    </p>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
    </>
  );
}
