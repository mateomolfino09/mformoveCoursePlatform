'use client';

import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { useCursoLanding } from './CursoLandingContext';
import {
  landingSectionContainer,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';

const prose =
  'text-lg leading-[1.55] tracking-tight text-palette-ink md:text-xl md:leading-[1.5] lg:text-[clamp(1.3125rem,2.2vw,1.75rem)] lg:leading-[1.45]';

export default function CourseHighlightsIntro() {
  const { cursoConfig, productName } = useCursoLanding();
  const { introHighlights } = cursoConfig;
  const bodyParagraphs = introHighlights.cuerpo.split('\n\n').filter(Boolean);

  return (
    <section className="relative isolate w-full overflow-hidden font-montserrat">
      <div className="border-t border-white/10 bg-palette-ink py-10 font-montserrat md:py-12">
        <div className={`mx-auto ${landingSectionContainer} text-center`}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-40px' }}
            className="flex flex-col items-center gap-2 md:flex-row md:flex-wrap md:items-baseline md:justify-center"
          >
            <div className="w-full min-w-0 max-w-none text-center">
              <h2 className={landingSectionTitleDark}>
                {introHighlights.titulo}
              </h2>
            </div>
            <p className="max-w-none text-[15px] font-light italic leading-relaxed text-palette-cream/85 md:text-[16px] md:shrink-0">
              {introHighlights.subtitulo}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Crema: desktop texto izquierda + foto derecha altura bloque; mobile texto arriba, foto abajo */}
      <div className="bg-palette-cream">
        <div
          className={`mx-auto flex w-full max-w-none flex-col md:justify-evenly gap-10 ${landingSectionContainer} py-12 md:min-h-[min(520px,70vh)] md:flex-row md:items-stretch md:gap-10 lg:min-h-[min(560px,72vh)] md:py-14 lg:py-16`}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-40px' }}
            className="order-1 flex min-w-0 flex-col justify-center font-raleway font-semibold md:order-1 "
          >
            <motion.div className={`${prose} max-w-2xl text-pretty md:max-w-none lg:max-w-[36rem] space-y-4`}>
              {bodyParagraphs.map((paragraph, index) => (
                <p key={`intro-body-${index}`}>{paragraph}</p>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-40px' }}
            className="order-2 relative w-full shrink-0 overflow-hidden rounded-2xl border border-palette-stone/20 shadow-[0_16px_48px_-20px_rgba(20,20,17,0.14)] min-h-[min(88vw,400px)] sm:min-h-[min(80vw,440px)] md:order-2 md:mt-0 md:min-h-0 md:w-[min(42vw,480px)] md:flex-none md:self-stretch md:rounded-3xl md:rounded-tl-3xl md:rounded-bl-3xl md:border-l-0 md:shadow-[0_20px_50px_-24px_rgba(20,20,17,0.12)] lg:w-[min(38vw,520px)]"
          >
            <div className="absolute inset-0 md:relative md:h-full md:min-h-full">
              <CldImage
                src={introHighlights.imagenMobilePublicId}
                alt={introHighlights.imagenAlt || productName}
                fill
                className="object-cover object-[center_22%] md:hidden"
                sizes="100vw"
                loader={imageLoader}
                priority={false}
              />
              <CldImage
                src={introHighlights.imagenDesktopPublicId}
                alt={introHighlights.imagenAlt || productName}
                fill
                className="hidden object-cover object-[center_28%] md:block"
                sizes="min(42vw, 520px)"
                loader={imageLoader}
                priority={false}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
