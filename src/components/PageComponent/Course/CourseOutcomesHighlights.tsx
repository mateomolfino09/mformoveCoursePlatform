'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { useCursoLanding } from './CursoLandingContext';
import {
  landingSectionContainer,
  landingSectionShell,
  landingSectionTitle,
} from '../../../constants/landingSectionDesign';

type OutcomeItem = {
  title: string;
  body: string;
};

const OutcomeRow = ({
  item,
  index,
}: {
  item: OutcomeItem;
  index: number;
}) => {
  const rowRef = useRef(null);
  const isInView = useInView(rowRef, { once: true, margin: '-120px' });
  const n = (index + 1).toString().padStart(2, '0');

  return (
    <motion.li
      ref={rowRef}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
      className="py-3.5 md:py-4 lg:py-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6 lg:gap-7">
        <span
          className="shrink-0 font-montserrat text-[clamp(1.25rem,2.8vw,1.5rem)] font-bold tabular-nums leading-none tracking-[-0.03em] text-palette-ink md:w-9 md:pt-0.5 md:text-[1.35rem]"
          aria-hidden
        >
          {n}
        </span>

        <div className="min-w-0 flex-1 space-y-2 md:space-y-2.5">
          <h3 className="mc-text-depth-light-title text-base font-montserrat font-semibold leading-snug tracking-tight text-palette-ink md:text-lg md:leading-snug">
            <span className="sr-only">
              {n}.{' '}
            </span>
            {item.title}
          </h3>
          <p className="max-w-none text-[15px] font-normal leading-[1.72] text-palette-stone md:text-[16px]">
            {item.body}
          </p>
        </div>
      </div>
    </motion.li>
  );
};

export default function CourseOutcomesHighlights() {
  const { cursoConfig } = useCursoLanding();
  const outcomes = cursoConfig.outcomes.items.map((item) => ({
    title: item.titulo,
    body: item.cuerpo,
  }));

  return (
    <section className={`${landingSectionShell} relative isolate overflow-hidden py-12 md:py-16`}>
      <div
        className="pointer-events-none absolute -top-28 right-[-18%] h-[min(340px,52vw)] w-[min(340px,52vw)] rounded-full bg-palette-sage/14 blur-[104px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-[-12%] h-[260px] w-[340px] rounded-full bg-palette-steel/12 blur-[98px]"
        aria-hidden
      />

      {/* Misma lógica que HighlightsIntro: md:justify-evenly + altura mínima; imagen a la izquierda, contenido a la derecha */}
      <div className={`relative z-10 ${landingSectionContainer} flex flex-col gap-7 py-4 text-left md:min-h-[min(320px,48vh)] md:flex-row md:items-stretch md:justify-between md:gap-10 md:py-6 lg:min-h-[min(360px,52vh)]`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-40px' }}
          className="order-2 relative w-full shrink-0 overflow-hidden rounded-2xl min-h-[min(52vw,220px)] sm:min-h-[min(48vw,240px)] md:order-1 md:mt-0 md:min-h-0 md:w-[min(38vw,400px)] md:flex-none md:self-stretch md:rounded-3xl md:rounded-tr-3xl md:rounded-br-3xl lg:w-[min(34vw,420px)]"
        >
          <div className="absolute inset-0 md:relative md:h-full md:min-h-full">
            <CldImage
              src={cursoConfig.outcomes.imagenPublicId}
              alt={cursoConfig.outcomes.imagenAlt || cursoConfig.outcomes.titulo}
              fill
              className="object-cover object-[center_22%] md:object-[center_28%]"
              sizes="(max-width: 768px) 100vw, min(42vw, 520px)"
              loader={imageLoader}
              priority={false}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-40px' }}
          className="order-1 flex min-w-0 flex-1 flex-col justify-center md:order-2 md:max-w-[min(100%,38rem)] lg:max-w-[min(100%,40rem)]"
        >
          <div
            className="relative mb-6 space-y-2 text-balance text-palette-ink md:mb-7 md:text-left"
            aria-label="Resultados del método"
          >
            <h2 className={`${landingSectionTitle} text-center md:text-left`}>
            {cursoConfig.outcomes.titulo}
            </h2>
          </div>

          <ol className="list-none" aria-label="Ocho resultados claros">
            {outcomes.map((item, index) => (
              <OutcomeRow key={item.title} item={item} index={index} />
            ))}
          </ol>
        </motion.div>
      </div>
    </section>
  );
}
