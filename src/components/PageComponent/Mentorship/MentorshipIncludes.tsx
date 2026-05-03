'use client';

import React from 'react';
import { motion } from 'framer-motion';

const productLines = [
  'Un programa de entrenamiento',
  'Ajustes cada dos semanas',
  'Una llamada al mes para trabajar conocimientos teóricos en el campo del movimiento y aprender más sobre el QUÉ, el CÓMO y el POR QUÉ de la práctica.',
] as const;

const lineFade = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.08 + i * 0.07 },
  }),
};

const MentorshipIncludes = () => {
  return (
    <section className="relative overflow-hidden bg-palette-ink font-montserrat">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-stone/25 to-transparent" />
      <div className="pointer-events-none absolute -top-32 right-[-20%] h-72 w-72 rounded-full bg-palette-sage/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-[-15%] h-96 w-96 rounded-full bg-palette-stone/[0.06] blur-3xl" />

      <div className="relative mx-auto my-12 md:my-0 w-[92%] max-w-6xl px-3 py-18 sm:px-4 md:py-24">
        <motion.div
          className="mb-12 max-w-3xl md:mb-14"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-50px' }}
        >
          <p className="mb-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.26em] text-palette-cream/55 md:text-xs">
            Lo que incluye
          </p>
          <h2 className="mb-4 text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-palette-cream md:text-4xl lg:text-[2.5rem] lg:leading-[1.08]">
            ¿Qué incluye la mentoría?
          </h2>
        </motion.div>

        <motion.ul
          className="max-w-3xl border-t border-white/10 pt-2"
          role="list"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {productLines.map((line, i) => (
            <motion.li
              key={line}
              custom={i}
              variants={lineFade}
              className="border-b border-white/[0.08] py-6 md:py-7"
            >
              <p className="max-w-2xl font-montserrat text-[17px] font-medium leading-snug tracking-tight text-palette-cream/95 md:text-[1.125rem] md:leading-snug lg:text-xl">
                {line}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
};

export default MentorshipIncludes;
