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
    <section id="por-que" className="relative isolate scroll-mt-28 overflow-hidden border-t border-white/10 bg-palette-ink py-10 font-montserrat md:py-12 lg:py-14">
      <CourseDarkSectionBackground />

      <div className="relative z-20 mx-auto w-full max-w-2xl px-5 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto max-w-xl"
        >
          <p className={`${landingEyebrowDark} mb-3 md:text-xs`}>
            {betweenHero.eyebrow}
          </p>
          <h2 className={`${landingSectionTitleDark} text-balance !text-[1.75rem] !leading-[1.14] sm:!text-[2.15rem] md:!text-[2.45rem] lg:!text-[2.7rem]`}>
            {betweenHero.titulo}
          </h2>
        </motion.div>

        <div className="mx-auto mt-5 max-w-xl space-y-4 text-left md:mt-6">
          {betweenHero.parrafos.map((paragraph, index) => (
            <motion.p
              key={`between-hero-${index}`}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: '-80px' }}
              className="text-[16px] font-normal leading-[1.65] text-palette-cream md:text-[17px]"
            >
              {paragraph}
            </motion.p>
          ))}
          {betweenHero.cierre?.trim() ? (
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: '-80px' }}
              className="pt-2 text-[18px] font-semibold leading-[1.6] text-palette-cream md:text-[20px]"
            >
              {betweenHero.cierre}
            </motion.p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
