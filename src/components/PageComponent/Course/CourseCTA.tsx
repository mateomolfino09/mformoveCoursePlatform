'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import {
  landingCtaInverted,
  landingEyebrowDark,
  landingSectionContainer,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';
import { routes } from '../../../constants/routes';

const CTA_BG = 'my_uploads/plaza/DSC03350_vgjrrh';

const CourseCTA = () => {
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
            <div className="pointer-events-none absolute inset-0 z-0">
              <CldImage
                src={CTA_BG}
                alt=""
                fill
                sizes="(max-width: 1280px) 85vw, 1152px"
                className="object-cover object-[center_42%] opacity-80"
                loader={imageLoader}
                preserveTransformations
              />
            </div>
            <div className="absolute inset-0 z-[1] bg-gradient-to-r from-palette-ink/90 via-palette-ink/70 to-palette-ink/35" />
            <div className="absolute inset-0 z-[1] bg-palette-ink/20" />

            <div className="relative z-[2] px-6 py-10 md:px-10 md:py-12">
              <p className={`${landingEyebrowDark} !text-palette-cream/70`}>
                Mentoría
              </p>
              <h2 className={`${landingSectionTitleDark} max-w-2xl`}>
                ¿Buscas una experiencia personalizada?
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] font-normal leading-relaxed text-palette-cream/88 md:text-[17px] lg:text-[18px]">
                Si quieres un acompañamiento evaluado, conmigo como mentor y un plan diseñado
               específicamente para tu proceso, checkea la mentoría.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={routes.navegation.mentoria}
                  className={`${landingCtaInverted} w-full sm:w-auto`}
                >
                  <span>Ver mentoría</span>
                  <span className="text-palette-ink/70 transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CourseCTA;
