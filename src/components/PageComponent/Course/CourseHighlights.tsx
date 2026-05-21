'use client'
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useId, useMemo, useRef, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import CourseHighlightsIntro from './CourseHighlightsIntro';
import { useCursoLanding } from './CursoLandingContext';
import type { IconType } from 'react-icons';
import {
  PiHexagonLight,
  PiCircleLight,
  PiTriangleLight,
  PiSquareLight,
  PiDiamondLight,
  PiCaretDownLight,
} from 'react-icons/pi';

type TimelineHighlightItem = {
  icon: IconType;
  title: string;
  description: string;
  expandedDescription: string;
  imagenPublicId: string;
};

/** Alineado con HighlightsIntro / BetweenHero: márgenes horizontales + bloque ancho para la “línea de tiempo”. */
const highlightsSectionPad =
  'mx-auto w-full max-w-none px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-28';

const splitDescription = (text: string) => {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  const idx = cleaned.indexOf('. ');
  if (idx === -1) return { lead: cleaned, rest: '' };
  const lead = cleaned.slice(0, idx + 1);
  const rest = cleaned.slice(idx + 2);
  return { lead, rest };
};

const HighlightItem = ({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: TimelineHighlightItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const rowRef = useRef(null);
  const isInView = useInView(rowRef, { once: true, margin: '-120px' });
  const uid = useId();
  const panelId = `highlight-panel-${uid}-${index}`;
  const titleId = `highlight-title-${uid}-${index}`;

  const { lead, rest } = useMemo(() => splitDescription(item.description), [item.description]);

  return (
    <motion.div
      ref={rowRef}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
      className="relative"
    >
      <div
        className="absolute left-[23px] top-0 bottom-0 w-[2px] bg-[linear-gradient(180deg,transparent_0%,rgba(59,50,44,0.38)_46%,rgba(143,157,179,0.26)_74%,transparent_100%)] md:left-[27px]"
        aria-hidden
      />

      <div className="group border-b border-palette-granite/[0.14]">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-palette-steel/50 focus-visible:ring-offset-2 focus-visible:ring-offset-palette-cream"
        >
          <div className="flex items-start gap-5 py-8 md:gap-6 md:py-10">
            <div className="relative mt-0.5 shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-palette-steel/40 bg-palette-cloud text-[12px] font-montserrat font-semibold tracking-[0.18em] text-palette-ink shadow-[inset_0_1px_0_rgba(255,253,253,0.45),0_4px_22px_-8px_rgba(59,50,44,0.28)] md:h-14 md:w-14 md:text-[13px]">
                {(index + 1).toString().padStart(2, '0')}
              </div>
              <div className="pointer-events-none absolute left-1/2 top-[3.25rem] h-4 w-px -translate-x-1/2 bg-gradient-to-b from-palette-steel/45 to-palette-granite/25 md:top-[3.75rem]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-2xl border border-palette-steel/35 bg-palette-granite text-palette-cream shadow-[inset_0_1px_0_rgba(255,253,253,0.42)] md:h-12 md:w-12">
                      <item.icon className="h-6 w-6 text-palette-cream md:h-[1.65rem] md:w-[1.65rem]" />
                    </span>
                    <h3
                      id={titleId}
                      className="mc-text-depth-light-title text-xl font-montserrat font-semibold leading-snug tracking-tight text-palette-ink md:text-2xl md:leading-tight lg:text-[1.65rem] lg:leading-snug"
                    >
                      {item.title}
                    </h3>
                  </div>
                  <p className="mc-text-depth-light mt-4 font-raleway text-lg font-semibold leading-relaxed text-palette-stone md:mt-5 md:text-xl md:leading-relaxed">
                    {lead}
                  </p>
                  <div className="relative mt-5 aspect-[16/10] w-full overflow-hidden rounded-2xl border border-palette-stone/20 bg-palette-stone/10 shadow-[0_8px_32px_-12px_rgba(20,20,17,0.12)] md:mt-6 md:rounded-3xl">
                    <CldImage
                      src={item.imagenPublicId}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 36rem"
                      loader={imageLoader}
                    />
                  </div>
                </div>

                <motion.span
                  aria-hidden="true"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="mt-1 shrink-0 text-palette-granite/50"
                >
                  <PiCaretDownLight className="h-6 w-6 md:h-7 md:w-7" />
                </motion.span>
              </div>
            </div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={titleId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pb-8 md:pb-10">
                <div className="ml-[3.25rem] border-t border-palette-granite/[0.18] pt-6 md:ml-[4rem] md:pt-7">
                  <p className="mc-text-depth-light font-raleway text-lg font-normal leading-relaxed text-palette-stone md:text-xl md:leading-relaxed">
                    {item.expandedDescription || rest || item.description.trim()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const CTACard = ({ index }: { index: number }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-100px' });
  const { cursoConfig, scrollToPlans } = useCursoLanding();
  const { highlights } = cursoConfig;

  return (
    <motion.div
      ref={cardRef}
      className="relative"
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={isInView ? {
        opacity: 1,
        y: 0,
        scale: 1,
      } : {}}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.08,
      }}
      whileHover={{
        scale: 1.03,
        y: -2,
        transition: {
          type: 'spring',
          stiffness: 220,
          damping: 18,
        },
      }}
      whileTap={{
        scale: 0.96,
        transition: {
          type: 'spring',
          stiffness: 380,
          damping: 28,
        },
      }}
    >
      <motion.div className="relative overflow-hidden border-y border-palette-stone/25">
        <div className="absolute inset-0">
          <CldImage
            src={highlights.ctaImagenPublicId}
            alt={cursoConfig.introHighlights.titulo}
            fill
            className="object-cover"
            loader={imageLoader}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-palette-ink/90 via-palette-ink/75 to-palette-ink/35" />
          <div className="absolute inset-0 bg-palette-ink/35 md:bg-transparent" />
        </div>

        <motion.div
          className="relative z-10 px-6 py-10 md:px-10 md:py-12"
          initial={{ opacity: 0, y: 6 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: 0.1 + (index * 0.08), ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mc-text-glow-ink font-montserrat uppercase tracking-[0.22em] text-sm text-palette-cloud/90">
            {highlights.ctaEyebrow}
          </p>

          <div className="mt-4 max-w-2xl">
            <motion.h3
              className="mc-text-glow-ink-title text-3xl md:text-4xl font-montserrat font-semibold text-palette-cream tracking-tight"
              initial={{ opacity: 0, y: 4 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.2 + (index * 0.08), ease: [0.16, 1, 0.3, 1] }}
            >
              {highlights.ctaTitulo}
            </motion.h3>
            <motion.p
              className="mc-text-glow-ink mt-4 text-base md:text-lg text-palette-cream/90 leading-relaxed font-light"
              initial={{ opacity: 0, y: 4 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.25 + (index * 0.08), ease: [0.16, 1, 0.3, 1] }}
            >
              {highlights.ctaDescripcion}
            </motion.p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <motion.button
              onClick={scrollToPlans}
              className="group inline-flex items-center justify-between gap-4 font-montserrat font-semibold text-base uppercase tracking-[0.18em] rounded-full px-7 py-3.5 bg-palette-cream text-palette-ink border-2 border-palette-cream/80 hover:bg-palette-sage hover:border-palette-sage transition-all duration-200 w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-palette-cream/50 focus-visible:ring-offset-2 focus-visible:ring-offset-palette-ink"
              initial={{ opacity: 0, y: 4 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.3 + (index * 0.08), ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{highlights.ctaBoton}</span>
              <span className="text-palette-ink/70 transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </motion.button>

          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

type CourseHighlightsProps = {
  /** Cuando es true, no renderiza la intro (ej. si ya se montó arriba en la página). */
  hideIntro?: boolean;
};

const CourseHighlights = ({ hideIntro = false }: CourseHighlightsProps) => {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const { cursoConfig } = useCursoLanding();
  const timelineItems: TimelineHighlightItem[] = useMemo(() => {
    const icons = [PiHexagonLight, PiCircleLight, PiTriangleLight, PiSquareLight, PiDiamondLight];
    const fallbackImg =
      cursoConfig.highlights.ctaImagenPublicId?.trim() || 'my_uploads/fondos/DSC01753_qdv9o0';

    return cursoConfig.highlights.items.map((item, index) => {
      const fromConfig = item.imagenPublicId?.trim();
      const fromModulo = cursoConfig.queIncluye.modulos.find((m) => m.titulo === item.titulo)
        ?.imagenPublicId?.trim();

      return {
        icon: icons[index % icons.length],
        title: item.titulo,
        description: item.resumen,
        expandedDescription: item.detalle,
        imagenPublicId: fromConfig || fromModulo || fallbackImg,
      };
    });
  }, [cursoConfig.highlights.items, cursoConfig.highlights.ctaImagenPublicId, cursoConfig.queIncluye.modulos]);

  return (
    <>
      {!hideIntro && <CourseHighlightsIntro />}
      <section className="relative isolate overflow-hidden bg-palette-cream pt-10 pb-16 font-montserrat md:pt-12 md:pb-20 lg:pb-28">
        <div className="pointer-events-none absolute -top-28 right-[-18%] h-[min(340px,52vw)] w-[min(340px,52vw)] rounded-full bg-palette-sage/14 blur-[104px]" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-[-12%] h-[260px] w-[340px] rounded-full bg-palette-steel/12 blur-[98px]" aria-hidden />
        <div
          className="pointer-events-none absolute left-[-10%] top-[18%] h-[min(420px,55vw)] w-[min(420px,55vw)] rounded-full bg-palette-granite/[0.075] blur-[118px]"
          aria-hidden
        />
        <div className={`${highlightsSectionPad} relative z-10 text-left`}>
          <div className="mx-auto max-w-5xl">
            {/* div (no <header>): en globals.css `header` está en fixed top-0 para la barra del sitio */}
            <div
              className="relative mx-auto mb-12 max-w-4xl space-y-4 text-balance text-center text-palette-ink md:mb-16 md:max-w-5xl"
              aria-label="Antes de la línea de tiempo"
            >
              <p className="mc-text-depth-light-title font-montserrat text-[clamp(2.15rem,6.2vw,4rem)] font-bold leading-[1.05] tracking-[-0.03em]">
                {cursoConfig.highlights.titulos[0]}
              </p>
              <p className="mc-text-depth-light-title font-montserrat text-[clamp(2.15rem,6.2vw,4rem)] font-bold leading-[1.05] tracking-[-0.03em]">
                {cursoConfig.highlights.titulos[1]}
              </p>
              <p className="mx-auto max-w-2xl pt-2 font-raleway text-[clamp(1.25rem,3.2vw,1.875rem)] font-semibold italic leading-snug text-palette-ink md:pt-4">
                {cursoConfig.highlights.puente}
              </p>
            </div>

            <div className="flex flex-col">
              {timelineItems.map((item, index) => (
                <HighlightItem
                  key={item.title}
                  item={item}
                  index={index}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex((cur) => (cur === index ? -1 : index))}
                />
              ))}
            </div>

            <div className="mt-12 md:mt-14">
              <CTACard index={5} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CourseHighlights;
