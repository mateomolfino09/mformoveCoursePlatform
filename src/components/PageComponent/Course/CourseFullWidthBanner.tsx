'use client';

import { motion } from 'framer-motion';
import { useCursoLanding } from './CursoLandingContext';

export default function CourseFullWidthBanner() {
  const { cursoConfig } = useCursoLanding();
  return (
    <section className="relative isolate w-full overflow-hidden bg-palette-ink py-10 md:py-12 lg:py-14 text-palette-cream">
      {/* Capas: atmósfera clara pero con personalidad — negro tinta + acentos steel/sage */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_95%_-10%,rgba(143,157,179,0.28),transparent_52%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_5%_105%,rgba(172,174,137,0.14),transparent_48%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[conic-gradient(from_210deg_at_75%_30%,transparent_0deg,rgba(143,157,179,0.08)_120deg,transparent_240deg,rgba(250,248,244,0.04)_320deg)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.085] mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-18deg, transparent, transparent 3px, rgba(250,248,244,0.45) 3px, rgba(250,248,244,0.45) 4px)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-cloud/35 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-palette-sage/25 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-none px-5 text-center sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-28">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-60px' }}
          className="mc-text-glow-ink mx-auto max-w-5xl text-balance font-raleway text-lg font-light leading-[1.45] tracking-tight text-palette-cream/95 md:text-xl md:leading-[1.4] lg:text-[clamp(1.3125rem,2.2vw,1.75rem)] lg:leading-[1.38] xl:text-[clamp(1.4rem,1.95vw,1.8125rem)]"
        >
          {cursoConfig.bannerAncho.cuerpo}
        </motion.p>
      </div>
    </section>
  );
}
