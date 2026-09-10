'use client';

import { motion } from 'framer-motion';
import {
  landingCtaPrimaryCompact,
  landingSectionContainer,
} from '../../../constants/landingSectionDesign';
import { CURSO_SALES_CALL_BOOKING_URL, cursoSalesCallCtaLabel } from '../../../constants/cursoSalesCall';
import { useCursoLanding } from './CursoLandingContext';

type CourseCallCtaBannerProps = {
  titulo?: string;
  boton?: string;
};

/**
 * Banda liviana de refuerzo del CTA de llamada, para repetirlo a mitad de página
 * (además del hero y de `CourseScheduleCall`) — mismo patrón que Mada repite
 * "Aplicar a la Formación" varias veces en su landing.
 */
export default function CourseCallCtaBanner({
  titulo = '¿Todavía no sabés si es para vos?',
  boton,
}: CourseCallCtaBannerProps) {
  const { productName } = useCursoLanding();
  const label = boton || cursoSalesCallCtaLabel(productName);
  return (
    <section className="border-t border-palette-stone/20 bg-palette-cream py-10 font-montserrat md:py-12">
      <div className={landingSectionContainer}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-40px' }}
          className="flex flex-col items-center justify-between gap-5 rounded-2xl border border-palette-stone/25 bg-white/70 px-6 py-7 text-center shadow-[0_20px_50px_-30px_rgba(20,20,17,0.16)] md:flex-row md:rounded-3xl md:px-10 md:py-8 md:text-left"
        >
          <p className="text-balance font-montserrat text-lg font-semibold tracking-tight text-palette-ink md:text-xl">
            {titulo}
          </p>
          <a
            href={CURSO_SALES_CALL_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${landingCtaPrimaryCompact} w-full shrink-0 md:w-auto`}
          >
            <span>{label}</span>
            <span className="opacity-80 transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
