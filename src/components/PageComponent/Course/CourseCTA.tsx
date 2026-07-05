'use client';

import { motion } from 'framer-motion';
import { useCursoLanding } from './CursoLandingContext';
import {
  landingCtaInverted,
  landingSectionContainer,
} from '../../../constants/landingSectionDesign';

const CourseCTA = () => {
  const { cursoConfig, scrollToPlans, productName } = useCursoLanding();
  const { ctaFinal } = cursoConfig;

  return (
    <section className="bg-palette-cream pb-20 pt-6 font-montserrat">
      <div className={`${landingSectionContainer.replace('w-[92%]', 'w-[85%]')}`}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="relative overflow-hidden border-y border-palette-stone/25">
            <div className="absolute inset-0 z-[1] bg-gradient-to-r from-palette-ink/90 via-palette-ink/70 to-palette-ink/35" />
            <div className="absolute inset-0 z-[1] bg-palette-ink/20" />

            <div className="relative z-[2] px-6 py-10 md:px-10 md:py-12">
              <p className="font-montserrat text-xs uppercase tracking-[0.2em] text-palette-cream/70">
                {productName || 'Curso'}
              </p>
              <h2 className="mt-4 max-w-2xl font-montserrat text-2xl font-semibold tracking-tight text-palette-cream md:text-3xl">
                {ctaFinal.titulo}
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-palette-cream/85 md:text-base">
                {ctaFinal.cuerpo}
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={scrollToPlans}
                  className={`${landingCtaInverted} w-full sm:w-auto`}
                >
                  <span>{ctaFinal.boton}</span>
                  <span className="text-palette-ink/70 transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CourseCTA;
