'use client';

import { motion } from 'framer-motion';
import { useCursoLanding } from './CursoLandingContext';
import CourseDarkSectionBackground from './CourseDarkSectionBackground';
import {
  landingEyebrowDark,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';

export default function CourseBetweenHeroSection() {
  const { cursoConfig } = useCursoLanding();
  const { betweenHero } = cursoConfig;

  return (
    <section className="relative isolate overflow-hidden border-t border-white/10 bg-palette-ink py-14 font-montserrat md:py-16 lg:py-20">
      <CourseDarkSectionBackground />

      <div className="relative z-20 mx-auto w-full max-w-none px-5 text-center sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto max-w-none lg:max-w-[min(52rem,calc(100vw-10rem))]"
        >
          <p className={`${landingEyebrowDark} mb-3 md:text-xs`}>
            {betweenHero.eyebrow}
          </p>
          <h2 className={landingSectionTitleDark}>
            {betweenHero.titulo}
          </h2>
        </motion.div>

        <ol className="mx-auto mt-11 max-w-4xl space-y-6 md:mt-14 md:space-y-7" aria-label={betweenHero.titulo}>
          {betweenHero.parrafos.map((paragraph, index) => (
            <motion.li
              key={`between-hero-${index}`}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true, margin: '-80px' }}
              className="flex items-start gap-4 text-left md:gap-5"
            >
              <span
                aria-hidden
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-palette-sage/70 bg-palette-ink font-montserrat text-sm font-semibold tabular-nums text-palette-cream shadow-[0_0_0_4px_rgba(223,224,195,0.12)] md:size-10 md:text-[15px]"
              >
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <p className="min-w-0 flex-1 pt-0.5 text-[18px] font-semibold leading-[1.7] text-palette-cream/90 md:text-[17px] lg:text-[24px]">
                {paragraph}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
