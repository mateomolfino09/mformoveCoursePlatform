'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import {
  landingCtaGhostDark,
  landingCtaUniformInverted,
  landingEyebrowDark,
  landingSectionContainer,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';
import {
  CURSO_SALES_CALL_BOOKING_URL,
  CURSO_SALES_CALL_CTA_LABEL,
} from '../../../constants/cursoSalesCall';
import { trackCursoLandingEvent } from '../../../lib/cursoLandingAnalytics';
import { useCursoLanding } from './CursoLandingContext';

const CTA_BG = 'my_uploads/plaza/DSC03350_vgjrrh';

const CourseCTA = () => {
  const router = useRouter();
  const { cursoConfig, checkoutStartPath, slug } = useCursoLanding();
  const ventaPorLlamada = Boolean(cursoConfig.planes.ventaPorLlamada);
  const { ctaFinal } = cursoConfig;

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
              className="object-cover object-[center_42%] opacity-70"
              loader={imageLoader}
            />
          </div>
          <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,rgba(20,20,17,0.92),rgba(20,20,17,0.86))] md:bg-[linear-gradient(to_right,rgba(20,20,17,0.94)_0%,rgba(20,20,17,0.9)_38%,rgba(20,20,17,0.45)_72%,rgba(20,20,17,0.28)_100%)]" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="relative z-[2] px-6 py-10 md:px-10 md:py-12"
          >
            <p className={`${landingEyebrowDark} !text-palette-cream/80`}>
              {ventaPorLlamada ? 'Último paso' : 'Inscripción'}
            </p>
            <h2 className={`${landingSectionTitleDark} max-w-xl`}>
              {ventaPorLlamada ? 'Si tenés dudas, podemos conversarlo.' : ctaFinal.titulo}
            </h2>
            <p className="mt-4 max-w-lg text-[15px] font-normal leading-relaxed text-palette-cream md:text-[17px]">
              {ventaPorLlamada
                ? 'Si querés saber si Cuerpo Autónomo encaja con lo que estás buscando, podés agendar una llamada corta y sin compromiso.'
                : ctaFinal.cuerpo}
            </p>

            <div className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
              {ventaPorLlamada ? (
                <a
                  href={CURSO_SALES_CALL_BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCursoLandingEvent('curso_llamada_click', { slug })}
                  className={`${landingCtaGhostDark} w-full sm:w-auto`}
                >
                  <span>{CURSO_SALES_CALL_CTA_LABEL}</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    trackCursoLandingEvent('curso_inscripcion_click', { slug });
                    router.push(checkoutStartPath);
                  }}
                  className={`${landingCtaUniformInverted} w-full min-w-0 max-w-full !px-4 sm:w-auto sm:min-w-[18rem] sm:!px-6`}
                >
                  <span>{ctaFinal.boton || 'Quiero sumarme'}</span>
                  <span className="text-palette-ink/70 transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CourseCTA;
