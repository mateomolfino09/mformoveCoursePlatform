'use client';

import { motion } from 'framer-motion';
import { useCursoLanding } from './CursoLandingContext';
import { landingSectionContainer } from '../../../constants/landingSectionDesign';

export default function CourseFullWidthBanner() {
  const { cursoConfig } = useCursoLanding();
  return (
    <section className="relative isolate w-full overflow-hidden border-t border-white/10 bg-palette-ink py-12 font-montserrat text-palette-cream md:py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-sage/25 to-transparent" aria-hidden />

      <div className={`relative z-10 ${landingSectionContainer} text-center`}>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-36px' }}
          className="mx-auto max-w-4xl border-l-2 border-palette-sage pl-5 text-left text-[15px] font-normal leading-[1.72] text-palette-cream/92 md:pl-6 md:text-[16px]"
        >
          {cursoConfig.bannerAncho.cuerpo}
        </motion.p>
      </div>
    </section>
  );
}
