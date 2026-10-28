'use client';

import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { useCursoLanding } from './CursoLandingContext';
import {
  landingSectionTitle,
  landingSplitSectionImageBase,
  landingSplitSectionLayout,
} from '../../../constants/landingSectionDesign';

const prose =
  'text-[18px] leading-[1.6] tracking-tight text-palette-ink md:text-[18px] md:leading-[1.58] lg:text-[1.55rem] lg:leading-[1.5]';

export default function CourseHighlightsIntro() {
  const { cursoConfig, productName } = useCursoLanding();
  const { introHighlights } = cursoConfig;
  const bodyParagraphs = introHighlights.cuerpo.split('\n\n').filter(Boolean);

  const bloques = introHighlights.bloques || [];
  const groupFrame = 'object-[center_32%]';

  return (
    <section id="como-se-vive" className="relative isolate w-full scroll-mt-28 overflow-hidden bg-palette-cream font-montserrat">
      <div className={landingSplitSectionLayout}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-40px' }}
          className="order-1 flex min-w-0 flex-col justify-center font-raleway font-semibold md:order-1"
        >
          <h2 className={landingSectionTitle}>{introHighlights.subtitulo}</h2>
          <motion.div className={`${prose} mt-6 max-w-2xl text-pretty md:mt-8 md:max-w-none lg:max-w-[36rem] space-y-4`}>
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
          className={`${landingSplitSectionImageBase} order-2 md:order-2 md:rounded-tl-3xl md:rounded-bl-3xl md:border-l-0`}
        >
          <div className="absolute inset-0 md:relative md:h-full md:min-h-full">
            <CldImage
              src={introHighlights.imagenMobilePublicId}
              alt={introHighlights.imagenAlt || productName}
              fill
              className={`object-cover md:hidden ${introHighlights.imagenMobilePublicId.includes('DSC03366') ? groupFrame : 'object-[center_22%]'}`}
              sizes="100vw"
              loader={imageLoader}
              priority={false}
            />
            <CldImage
              src={introHighlights.imagenDesktopPublicId}
              alt={introHighlights.imagenAlt || productName}
              fill
              className={`hidden object-cover md:block ${introHighlights.imagenDesktopPublicId.includes('DSC03366') ? groupFrame : 'object-[center_28%]'}`}
              sizes="min(42vw, 520px)"
              loader={imageLoader}
              priority={false}
            />
          </div>
        </motion.div>
      </div>
      {bloques.length > 0 ? (
        <ol className="mx-auto grid w-[92%] max-w-6xl gap-4 px-3 pb-14 sm:px-4 md:grid-cols-3 md:gap-5 md:pb-16">
          {bloques.map((bloque, index) => (
            <li
              key={bloque.titulo}
              className="rounded-2xl border border-palette-stone/20 bg-white/80 p-5 text-left shadow-[0_14px_40px_-24px_rgba(20,20,17,0.12)] md:p-6"
            >
              <p className="font-montserrat text-sm font-semibold tabular-nums text-palette-ink/40">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-3 font-montserrat text-lg font-semibold leading-snug text-palette-ink">
                {bloque.titulo}
              </h3>
              <p className="mt-2 text-[15px] font-normal leading-relaxed text-palette-ink/85">
                {bloque.cuerpo}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
