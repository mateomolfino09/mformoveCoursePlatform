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


        <div className="mt-2 border-t border-palette-cream/10 pt-12 md:pt-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-10 lg:gap-12">
          {modules.map((item, i) => {
            const n = (i + 1).toString().padStart(2, '0');
            const isLastOdd = i === modules.length - 1 && modules.length % 2 === 1;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-32px' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={`flex flex-col text-left ${
                  isLastOdd ? 'md:col-span-2 md:mx-auto md:max-w-2xl' : ''
                }`}
              >
                <div className="mb-4 flex items-baseline gap-3 md:mb-5">
                  <span className="font-montserrat text-[clamp(2rem,4.5vw,3.25rem)] font-bold tabular-nums tracking-tight text-palette-cream/25">
                    {n}
                  </span>
                  <h3 className="mc-text-ink-shadow flex-1 font-montserrat text-[clamp(1.05rem,2.4vw,1.45rem)] font-semibold leading-snug text-palette-cream md:leading-tight lg:text-[clamp(1.15rem,1.8vw,1.6rem)]">
                    {item.title}
                  </h3>
                </div>
                <div className="group relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-palette-cream/15 bg-palette-ink/40 shadow-[0_8px_36px_rgba(0,0,0,0.25)] md:mb-5 md:rounded-3xl">
                  <CldImage
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 42vw"
                    loader={imageLoader}
                  />
                </div>
                <p className="font-raleway text-[clamp(1rem,2.3vw,1.2rem)] leading-relaxed text-palette-cream/85 md:text-[1.125rem] md:leading-relaxed">
                  {item.line}
                </p>
              </motion.article>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}
