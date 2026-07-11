'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import CourseHighlightsIntro from './CourseHighlightsIntro';
import { useCursoLanding } from './CursoLandingContext';
import {
  landingCardBody,
  landingCtaPrimary,
  landingEyebrow,
  landingSectionBodyMuted,
  landingSectionContainer,
  landingSectionShell,
  landingSectionTitle,
} from '../../../constants/landingSectionDesign';

type CourseHighlightsProps = {
  /** Cuando es true, no renderiza la intro (ej. si ya se montó arriba en la página). */
  hideIntro?: boolean;
};

type TimelineHighlightItem = {
  titulo: string;
  resumen: string;
  detalle: string;
  imagenPublicId: string;
};

const CourseHighlights = ({ hideIntro = false }: CourseHighlightsProps) => {
  const { cursoConfig, scrollToPlans } = useCursoLanding();
  const { highlights } = cursoConfig;

  const timelineItems = useMemo((): TimelineHighlightItem[] => {
    const fallbackImg =
      highlights.ctaImagenPublicId?.trim() || 'my_uploads/fondos/DSC01753_qdv9o0';

    return highlights.items.map((item) => {
      const fromConfig = item.imagenPublicId?.trim();
      const fromModulo = cursoConfig.queIncluye.modulos
        .find((m) => m.titulo === item.titulo)
        ?.imagenPublicId?.trim();
      const detalle =
        item.detalle?.trim() && item.detalle.trim() !== item.resumen.trim()
          ? item.detalle.trim()
          : '';

      return {
        titulo: item.titulo,
        resumen: item.resumen,
        detalle,
        imagenPublicId: fromConfig || fromModulo || fallbackImg,
      };
    });
  }, [cursoConfig.queIncluye.modulos, highlights.ctaImagenPublicId, highlights.items]);

  return (
    <>
      {!hideIntro && <CourseHighlightsIntro />}
      <section className={`${landingSectionShell} relative isolate overflow-hidden py-10 md:py-14`}>
        <div className={`${landingSectionContainer} relative z-10 text-left`}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-36px' }}
            className="max-w-3xl"
          >
            <h2 className={landingSectionTitle}>{highlights.titulos[0]}</h2>
            {highlights.titulos[1] ? (
              <p className={`${landingSectionBodyMuted} mt-2 max-w-2xl !text-palette-ink/85`}>
                {highlights.titulos[1]}
              </p>
            ) : null}
            {highlights.puente ? (
              <p className={`${landingSectionBodyMuted} mt-4 max-w-2xl italic`}>{highlights.puente}</p>
            ) : null}
          </motion.div>

          <ol className="relative mt-8 md:mt-10" aria-label="Pasos del método">
            <span
              aria-hidden
              className="absolute bottom-3 left-[17px] top-3 w-0.5 bg-gradient-to-b from-palette-sage/25 via-palette-sage/70 to-palette-sage/25"
            />

            {timelineItems.map((item, index) => (
                <motion.li
                  key={`${item.titulo}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.38,
                    delay: Math.min(index * 0.04, 0.16),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  viewport={{ once: true, margin: '-24px' }}
                  className={`relative flex items-start gap-4 md:gap-5 ${
                    index < timelineItems.length - 1
                      ? 'border-b border-palette-stone/12 pb-6 md:pb-8'
                      : 'pb-0'
                  } ${index > 0 ? 'pt-6 md:pt-8' : ''}`}
                >
                  <div className="relative z-10 shrink-0">
                    <span
                      aria-hidden
                      className="flex size-9 items-center justify-center rounded-full border-2 border-palette-sage bg-white font-montserrat text-sm font-semibold tabular-nums text-palette-ink shadow-[0_0_0_4px_rgba(223,224,195,0.42)] md:size-10 md:text-[15px]"
                    >
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                    <div className="min-w-0 flex-1 py-2 pr-1 md:py-3 md:pr-2 lg:py-4">
                      <h3 className="font-semibold text-[16px] leading-snug tracking-tight text-palette-ink md:text-[17px]">
                        {item.titulo}
                      </h3>
                      <p className={`${landingCardBody} !mt-2 !text-palette-ink/88 md:!mt-2.5`}>
                        {item.resumen}
                      </p>
                      {item.detalle ? (
                        <p className="mt-2 text-[14px] font-light leading-[1.6] text-palette-stone md:mt-2.5 md:text-[15px]">
                          {item.detalle}
                        </p>
                      ) : null}
                    </div>

                    <div className="relative mt-1 h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl border border-palette-stone/15 bg-palette-stone/5 sm:h-20 sm:w-20 md:mt-0.5 md:h-[5.5rem] md:w-[5.5rem] md:rounded-2xl lg:h-24 lg:w-24">
                      <CldImage
                        src={item.imagenPublicId}
                        alt={item.titulo}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 72px, 96px"
                        loader={imageLoader}
                      />
                    </div>
                  </div>
                </motion.li>
              ))}
          </ol>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-24px' }}
            className="mt-10 border-t border-palette-stone/20 pt-8 md:mt-12 md:pt-10"
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
              <div className="max-w-xl">
                <p className={landingEyebrow}>{highlights.ctaEyebrow}</p>
                <h3 className="mt-3 text-[1.35rem] font-semibold leading-tight tracking-tight text-palette-ink md:text-[1.65rem]">
                  {highlights.ctaTitulo}
                </h3>
                <p className={`${landingCardBody} mt-2`}>{highlights.ctaDescripcion}</p>
              </div>
              <button
                type="button"
                onClick={scrollToPlans}
                className={`${landingCtaPrimary} group shrink-0 self-start md:self-end`}
              >
                <span>{highlights.ctaBoton}</span>
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default CourseHighlights;
