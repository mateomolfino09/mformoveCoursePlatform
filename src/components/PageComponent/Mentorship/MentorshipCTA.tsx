'use client'

import React from 'react';
import { motion } from 'framer-motion';
import MentorshipApplyButton from './MentorshipApplyButton';
import {
  landingEyebrowDark,
  landingSectionBodyDark,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';

const CTA_BG = 'my_uploads/plaza/DSC03350_vgjrrh';

const MentorshipCTA = () => {
  return (
    <section className="pt-6 pb-20 bg-palette-cream font-montserrat">
      <div className="w-[85%] max-w-6xl mx-auto px-4">
        <div className="relative overflow-hidden border-y border-palette-stone/25">
          <div className="pointer-events-none absolute inset-0 z-0">
            <CldImage
              src={CTA_BG}
              alt=""
              fill
              sizes="(max-width: 1280px) 85vw, 1152px"
              className="object-cover object-[center_42%] opacity-[0.8]"
              loader={imageLoader}
            />
          </div>
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-palette-ink/90 via-palette-ink/70 to-palette-ink/35" />
          <div className="absolute inset-0 z-[1] bg-palette-ink/20" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="relative z-[2] px-6 py-10 md:px-10 md:py-12"
          >
            <p className={`${landingEyebrowDark} !text-palette-cream/70`}>
              Mentoría
            </p>
            <h2 className={`${landingSectionTitleDark} max-w-2xl`}>
              Elegí el plan que mejor acompañe tu proceso.
            </h2>
            <p className={`${landingSectionBodyDark} max-w-2xl`}>
              Más práctica, más claridad y un seguimiento adaptado a vos.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <MentorshipApplyButton variant="inverted" className="w-full sm:w-auto" />

              <p className="text-xs font-light text-palette-cream/70 md:text-sm">
                Los cupos son limitados y varían según cada ciclo de trabajo.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MentorshipCTA;
