'use client'
import { motion } from 'framer-motion';
import { useCursoLanding } from './CursoLandingContext';
import { sectionMainTitle } from './courseSectionTitle';

const CourseCTA = () => {
  const { cursoConfig, scrollToPlans } = useCursoLanding();
  const { ctaFinal } = cursoConfig;

  return (
    <section className="relative isolate overflow-hidden py-12 md:py-14 bg-palette-ink text-palette-cream font-montserrat">
      <div className="pointer-events-none absolute top-0 right-[-20%] h-[300px] w-[300px] rounded-full bg-palette-steel/30 blur-[95px]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-28 left-[-15%] h-[320px] w-[320px] rounded-full bg-palette-sage/15 blur-[95px]" aria-hidden />
      <div className="relative w-[85%] max-w-6xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className={`mc-text-glow-ink-title ${sectionMainTitle} text-palette-cream mb-6`}
        >
         {ctaFinal.titulo}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="mc-text-glow-ink font-raleway italic text-palette-cloud/95 text-lg md:text-xl max-w-3xl mx-auto font-light mb-8 leading-relaxed"
        >
          {ctaFinal.cuerpo}
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          viewport={{ once: true }}
          onClick={scrollToPlans}
          className="inline-flex font-montserrat font-semibold text-base uppercase tracking-[0.18em] rounded-full px-7 py-3.5 bg-palette-cream text-palette-ink border-2 border-palette-cream/80 hover:bg-palette-sage hover:border-palette-sage transition-all duration-200"
        >
          {ctaFinal.boton}
        </motion.button>
      </div>
    </section>
  );
};

export default CourseCTA;
