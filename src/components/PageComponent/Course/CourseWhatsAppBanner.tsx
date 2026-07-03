'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { useCursoLanding } from './CursoLandingContext';
import { sectionMainTitle } from './courseSectionTitle';
import {
  CURSO_WHATSAPP_BANNER_MOBILE_PUBLIC_ID,
  resolveCursoWhatsappBannerPublicIds,
} from '../../../types/cursoLanding';

export default function CourseWhatsAppBanner() {
  const { cursoConfig } = useCursoLanding();
  const { whatsapp } = cursoConfig;
  const imagenAlt = whatsapp.imagenAlt || whatsapp.titulo;

  const { imagenMobilePublicId, imagenDesktopPublicId } = resolveCursoWhatsappBannerPublicIds(
    whatsapp.imagenMobilePublicId,
    whatsapp.imagenDesktopPublicId
  );

  const [mobilePublicId, setMobilePublicId] = useState(imagenMobilePublicId);

  useEffect(() => {
    setMobilePublicId(imagenMobilePublicId);
  }, [imagenMobilePublicId]);

  const handleMobileImageError = () => {
    if (mobilePublicId !== CURSO_WHATSAPP_BANNER_MOBILE_PUBLIC_ID) {
      setMobilePublicId(CURSO_WHATSAPP_BANNER_MOBILE_PUBLIC_ID);
      return;
    }
    if (mobilePublicId !== imagenDesktopPublicId) {
      setMobilePublicId(imagenDesktopPublicId);
    }
  };

  return (
    <section
      aria-label="Contacto por WhatsApp"
      className="relative left-1/2 isolate flex min-h-[min(92vw,26rem)] w-screen max-w-none -translate-x-1/2 flex-col overflow-hidden bg-palette-cream font-montserrat sm:min-h-[min(84vw,30rem)] md:min-h-[min(72vh,52rem)]"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {mobilePublicId ? (
          <div className="absolute inset-0 md:hidden">
            <CldImage
              src={mobilePublicId}
              alt={imagenAlt}
              fill
              className="object-cover object-[right_22%]"
              sizes="100vw"
              loader={imageLoader}
              priority
              onError={handleMobileImageError}
            />
          </div>
        ) : null}
        {imagenDesktopPublicId ? (
          <div className="absolute inset-0 hidden md:block">
            <CldImage
              src={imagenDesktopPublicId}
              alt={imagenAlt}
              fill
              className="object-cover object-[center_10%]"
              sizes="100vw"
              loader={imageLoader}
              priority={false}
            />
          </div>
        ) : null}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: '-40px' }}
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-evenly mt-32 md:mt-0 md:justify-center py-[min(11vw,4.5rem)] px-5 text-center sm:px-8 sm:py-24 md:py-[min(21vw,7.5rem)] md:px-5 md:py-28 lg:py-32"
      >
        <h2 className={`max-w-[14ch] text-balance ${sectionMainTitle} text-black [text-shadow:white_1px_1px_1px]`}>
          {whatsapp.titulo}
        </h2>

        <div className="mt-10 md:mt-12">
          <a
            href={whatsapp.enlace}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border-2 border-palette-ink bg-palette-ink px-7 py-3.5 font-montserrat text-base font-semibold uppercase tracking-[0.18em] text-palette-cream transition-all duration-200 hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-palette-sage/55 focus-visible:ring-offset-2 focus-visible:ring-offset-palette-cream"
          >
            {whatsapp.ctaTexto}
          </a>
        </div>
      </motion.div>
    </section>
  );
}
