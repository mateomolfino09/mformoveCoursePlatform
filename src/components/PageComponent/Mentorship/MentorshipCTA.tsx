'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';

const CTA_BG = 'my_uploads/plaza/DSC03350_vgjrrh';

const MentorshipCTA = () => {
  return (
    <section className="pt-6 pb-20 bg-palette-cream font-montserrat">
      <div className="w-[85%] max-w-6xl mx-auto px-4">
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
                className="object-cover object-[center_42%] opacity-[0.14] md:opacity-[0.18]"
                loader={imageLoader}
                preserveTransformations
              />
            </div>
            <div className="absolute inset-0 z-[1] bg-gradient-to-r from-palette-ink/90 via-palette-ink/70 to-palette-ink/35" />
            <div className="absolute inset-0 z-[1] bg-palette-ink/20" />

            <div className="relative z-[2] px-6 py-10 md:px-10 md:py-12">
              <p className="font-montserrat uppercase tracking-[0.2em] text-xs text-palette-cream/70">
                Mentoría
              </p>
              <h2 className="mt-4 text-2xl md:text-3xl font-montserrat font-semibold text-palette-cream tracking-tight max-w-2xl">
                Si querés avanzar con claridad, elegí un plan y empezamos.
              </h2>
              <p className="mt-4 text-sm md:text-base text-palette-cream/85 leading-relaxed font-light max-w-2xl">
                Menos ruido. Más práctica, feedback y dirección.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/mentoria/consulta"
                  className="group inline-flex w-full items-center justify-between gap-4 rounded-full border-2 border-palette-cream/80 bg-palette-cream px-7 py-3 font-montserrat text-sm font-semibold uppercase tracking-[0.2em] text-palette-ink transition-all duration-200 hover:border-white hover:bg-white sm:w-auto"
                >
                  <span>Aplicar a mentoría</span>
                  <span className="text-palette-ink/70 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </Link>

                <p className="text-xs font-light text-palette-cream/70 md:text-sm">
                  Cupos y disponibilidad varían por ciclo. Podés revisar&nbsp;
                  <button
                    type="button"
                    onClick={() => document.getElementById('mentorship-plans')?.scrollIntoView({ behavior: 'smooth' })}
                    className="underline decoration-palette-cream/40 underline-offset-2 hover:decoration-palette-cream/80"
                  >
                    planes
                  </button>
                  &nbsp;cuando quieras.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MentorshipCTA; 