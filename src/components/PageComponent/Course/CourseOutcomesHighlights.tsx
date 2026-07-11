'use client';

import { motion } from 'framer-motion';
import { useCursoLanding } from './CursoLandingContext';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import {
  landingCardBody,
  landingSectionTitle,
  landingSplitSectionImageBase,
  landingSplitSectionLayout,
} from '../../../constants/landingSectionDesign';

type OutcomeEntry = {
  title: string;
  body: string;
};

const OutcomeListItem = ({
  item,
  index,
  isLast,
}: {
  item: OutcomeEntry;
  index: number;
  isLast: boolean;
}) => (
  <motion.li
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.36, delay: Math.min(index * 0.04, 0.2), ease: [0.16, 1, 0.3, 1] }}
    viewport={{ once: true, margin: '-40px' }}
    className={`relative flex items-start justify-between gap-4 pl-0 pr-5 md:gap-5 md:pr-6 ${!isLast ? 'border-b border-palette-stone/12 pb-5 md:pb-6' : ''} ${index > 0 ? 'pt-5 md:pt-6' : ''}`}
  >
    <div className="min-w-0 flex-1">
      <h3 className="font-montserrat text-[15px] font-semibold leading-snug tracking-tight text-palette-ink md:text-[16px]">
        {item.title}
      </h3>
      <p className={`${landingCardBody} !mt-1.5 !text-palette-ink/82`}>{item.body}</p>
    </div>
    <span
      aria-hidden
      className="relative z-10 mt-[0.6rem] size-2 shrink-0 rounded-full bg-palette-sage shadow-[0_0_0_4px_#FAF8F4]"
    />
  </motion.li>
);

export default function CourseOutcomesHighlights() {
  const { cursoConfig } = useCursoLanding();
  const outcomes = cursoConfig.outcomes.items.map((item) => ({
    title: item.titulo,
    body: item.cuerpo,
  }));

  return (
    <section className="relative isolate w-full overflow-hidden bg-palette-cream font-montserrat">
      <div className={landingSplitSectionLayout}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-40px' }}
          className={`${landingSplitSectionImageBase} order-1 md:order-1 md:rounded-tr-3xl md:rounded-br-3xl md:border-r-0`}
        >
          <div className="absolute inset-0 md:relative md:h-full md:min-h-full">
            <CldImage
              src={cursoConfig.outcomes.imagenPublicId}
              alt={cursoConfig.outcomes.imagenAlt || cursoConfig.outcomes.titulo}
              fill
              className="object-cover object-[center_24%] md:object-[center_28%]"
              sizes="(max-width: 768px) 100vw, min(42vw, 520px)"
              loader={imageLoader}
              priority={false}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-40px' }}
          className="order-2 flex min-w-0 flex-1 flex-col justify-center md:order-2"
        >
          <h2 className={`${landingSectionTitle} !mt-0 max-w-2xl text-balance lg:max-w-[36rem]`}>
            {cursoConfig.outcomes.titulo}
          </h2>

          <ol className="relative mt-6 list-none md:mt-8" aria-label="Resultados del método">
            <span
              aria-hidden
              className="absolute bottom-3 right-[3px] top-3 w-px bg-gradient-to-b from-palette-sage/25 via-palette-sage/60 to-palette-sage/25"
            />
            {outcomes.map((item, index) => (
              <OutcomeListItem
                key={item.title}
                item={item}
                index={index}
                isLast={index === outcomes.length - 1}
              />
            ))}
          </ol>
        </motion.div>
      </div>
    </section>
  );
}
