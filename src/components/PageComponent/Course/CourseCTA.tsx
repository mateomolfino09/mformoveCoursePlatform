'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import {
  landingCtaGhostDark,
  landingCtaInverted,
  landingCtaInvertedCompact,
  landingEyebrowDark,
  landingSectionContainer,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';
import { routes } from '../../../constants/routes';
import {
  CURSO_SALES_CALL_BOOKING_URL,
  cursoSalesCallCtaLabel,
} from '../../../constants/cursoSalesCall';
import { useCursoLanding } from './CursoLandingContext';

const CTA_BG = 'my_uploads/plaza/DSC03350_vgjrrh';

const CourseCTA = () => {
  const { cursoConfig, productName } = useCursoLanding();
  const ventaPorLlamada = Boolean(cursoConfig.planes.ventaPorLlamada);

  return (
    <section className="relative isolate overflow-hidden border-t border-palette-stone/40 bg-palette-ink pb-20 pt-10 font-montserrat md:pt-12">
      <div className={`${landingSectionContainer.replace('w-[92%]', 'w-[85%]')}`}>
        <div className="relative overflow-hidden rounded-2xl border border-palette-stone/45 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.55)] ring-1 ring-black/30 md:rounded-3xl">
          <div className="pointer-events-none absolute inset-0 z-0">
            <CldImage
              src={CTA_BG}
              alt=""
              fill
              sizes="(max-width: 1280px) 85vw, 1152px"
              className="object-cover object-[center_42%] opacity-80"
              loader={imageLoader}
            />
          </div>
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-palette-ink/92 via-palette-ink/75 to-palette-ink/40" />
          <div className="absolute inset-0 z-[1] bg-palette-ink/25" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="relative z-[2] px-6 py-10 md:px-10 md:py-12"
          >
            <p className={`${landingEyebrowDark} !text-palette-cream/70`}>
              {ventaPorLlamada ? 'Último paso' : 'Mentoría'}
            </p>
            <h2 className={`${landingSectionTitleDark} max-w-2xl`}>
              {ventaPorLlamada
                ? 'Volvé a sentirte dueño de tus movimientos.'
                : '¿Buscas una experiencia personalizada?'}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] font-normal leading-relaxed text-palette-cream/88 md:text-[17px] lg:text-[18px]">
              {ventaPorLlamada
                ? 'Agendá una llamada corta y sin costo para resolver tus dudas y ver si este programa es para vos.'
                : 'Si quieres un acompañamiento evaluado, conmigo como mentor y un plan diseñado específicamente para tu proceso, checkea la mentoría.'}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {ventaPorLlamada ? (
                <>
                  <a
                    href={CURSO_SALES_CALL_BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${landingCtaInvertedCompact} w-full sm:w-auto`}
                  >
                    <span>{cursoSalesCallCtaLabel(productName)}</span>
                    <span className="text-palette-ink/70 transition-transform duration-200 group-hover:translate-x-0.5">
                      →
                    </span>
                  </a>
                  <Link
                    href={routes.navegation.mentoria}
                    className={`${landingCtaGhostDark} w-full sm:w-auto`}
                  >
                    <span>¿Buscás algo más personalizado? Ver mentoría</span>
                  </Link>
                </>
              ) : (
                <Link
                  href={routes.navegation.mentoria}
                  className={`${landingCtaInverted} w-full sm:w-auto`}
                >
                  <span>Ver mentoría</span>
                  <span className="text-palette-ink/70 transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CourseCTA;
