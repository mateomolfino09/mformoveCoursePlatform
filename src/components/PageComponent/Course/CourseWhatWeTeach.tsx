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

const offerIconByKey = {
  book: PiBookOpenLight,
  video: PiMonitorPlayLight,
  live: PiMicrophoneStageLight,
  community: PiUsersThreeLight,
} as const;

const iconShell =
  'border border-palette-steel/30 bg-palette-granite text-palette-cream shadow-[inset_0_1px_0_rgba(255,253,253,0.6)]';

const padX = 'w-[90%] max-w-7xl mx-auto px-4 sm:px-5';

/** Ruido muy suave sobre el fondo marrón (no depende de assets externos). */
const OFFER_CARD_NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

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
      className="relative isolate overflow-hidden bg-palette-cloud py-16 font-montserrat md:py-20 lg:py-24"
      id={queIncluye.anclaId}
      aria-labelledby={`${queIncluye.anclaId}-heading`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-palette-skysteel/40 via-palette-cream/80 to-palette-steel/[0.12]"
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
            className="mc-text-depth-light-title font-montserrat text-[clamp(2.35rem,6.4vw,4.35rem)] font-bold leading-[1.02] tracking-[-0.03em] text-palette-ink"          >
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
                <div
                  key={i}
                  className="group/offer-card relative isolate flex min-h-[12.5rem] cursor-default flex-col items-center gap-3 overflow-hidden rounded-2xl border border-palette-steel/22 bg-palette-granite px-4 py-6 text-center shadow-[0_10px_36px_-18px_rgba(20,20,17,0.18)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-palette-steel/35 hover:shadow-[0_22px_48px_-20px_rgba(59,50,44,0.52)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:min-h-[13rem] sm:px-5 sm:py-7 md:min-h-[14rem] md:rounded-[1.35rem] md:px-6 md:py-8"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[length:160px_160px] opacity-[0.065] mix-blend-overlay"
                    style={{ backgroundImage: OFFER_CARD_NOISE_BG }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/[0.07] via-transparent to-black/35 opacity-90 transition-opacity duration-300 group-hover/offer-card:opacity-100"
                  />
                  <div
                    className={`relative z-[1] flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 ease-out group-hover/offer-card:scale-[1.06] motion-reduce:transition-none md:h-[3.5rem] md:w-[3.5rem] ${block.iconShell}`}
                    aria-hidden
                  >
                    <Icon className="h-8 w-8 md:h-8 md:w-8" />
                  </div>
                  <div className="relative z-[1] flex flex-1 flex-col items-center justify-center gap-0.5">
                    {block.lines.map((line, j) => {
                      const isHighlighted =
                        block.highlightedLineIndex !== null && j === block.highlightedLineIndex;
                      if (isHighlighted) {
                        return (
                          <span
                            key={j}
                            className="mt-1 font-raleway text-[clamp(0.85rem,2.3vw,1.05rem)] font-semibold normal-case tracking-normal text-palette-cream"
                          >
                            {line}
                          </span>
                        );
                      }
                      return (
                        <span
                          key={j}
                          className={`font-montserrat font-bold uppercase tracking-[-0.02em] text-palette-cream ${
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
                  <p className="relative z-[1] mt-1 max-w-[16rem] font-raleway text-[0.75rem] font-normal leading-snug text-palette-skysteel/85 transition-colors duration-300 group-hover/offer-card:text-palette-skysteel sm:text-[0.8rem] md:mt-2 md:text-[0.875rem] md:leading-relaxed lg:max-w-[18rem] lg:text-[0.9375rem]">
                    {block.hint}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>


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
                  <span className="font-montserrat text-[clamp(2rem,4.5vw,3.25rem)] font-bold tabular-nums tracking-tight text-palette-deep-teal/30">
                    {n}
                  </span>
                  <h3 className="mc-text-depth-light-title flex-1 font-montserrat text-[clamp(1.05rem,2.4vw,1.45rem)] font-semibold leading-snug text-palette-ink md:leading-tight lg:text-[clamp(1.15rem,1.8vw,1.6rem)]">
                    {item.title}
                  </h3>
                </div>
                <div className="group relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-palette-stone/25 bg-palette-stone/10 shadow-[0_8px_36px_rgba(20,20,17,0.07)] md:mb-5 md:rounded-3xl">
                  <CldImage
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 42vw"
                    loader={imageLoader}
                  />
                </div>
                <p className="font-raleway text-[clamp(1rem,2.3vw,1.2rem)] leading-relaxed text-palette-stone md:text-[1.125rem] md:leading-relaxed">
                  {item.line}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
