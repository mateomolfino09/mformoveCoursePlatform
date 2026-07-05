'use client';

import React from 'react';
import { motion } from 'framer-motion';

const pillars = [
  {
    title: 'Prácticas internas',
    description: 'Respiración, atención y regulación.',
  },
  {
    title: 'Capacidades orgánicas',
    description:
      'Fuerza, movilidad y resistencia construidas a través del movimiento natural.',
  },
  {
    title: 'Movilidad específica',
    description: 'Desarrollar rangos concretos cuando la práctica lo requiere.',
  },
  {
    title: 'Fuerza específica',
    description: 'Construir capacidades físicas de manera deliberada y progresiva.',
  },
  {
    title: 'Habilidades coordinativas',
    description:
      'Aprender, jugar, adaptarse y resolver problemas a través del movimiento.',
  },
];

export default function MentorshipPillars() {
  return (
    <section className="border-t border-palette-stone/20 bg-palette-cream font-montserrat py-12 md:py-16">
      <div className="w-[92%] max-w-6xl mx-auto px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-36px' }}
          className="mb-9 md:mb-11 max-w-xl"
        >
          <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-palette-ink">
            El método
          </p>
          <h2 className="mt-3 text-[1.65rem] sm:text-[2rem] md:text-[2.35rem] font-semibold text-palette-ink tracking-tight leading-[1.1]">
            Los pilares del método
          </h2>
          <p className="mt-3 text-[14px] md:text-[15px] text-palette-ink font-light leading-[1.65] opacity-90">
            Cinco dimensiones que se entrelazan a lo largo del proceso. Se activan según lo que tu práctica necesita en cada etapa.
          </p>
        </motion.div>

        <ol className="border-t border-palette-stone/15">
          {pillars.map((pillar, index) => (
            <motion.li
              key={pillar.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-24px' }}
              transition={{
                duration: 0.4,
                delay: Math.min(index * 0.05, 0.2),
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-baseline gap-5 border-b border-palette-stone/15 py-6 md:gap-8 md:py-7"
            >
              <span
                className="shrink-0 font-montserrat text-2xl font-semibold tabular-nums leading-none text-palette-ink/25 md:text-3xl"
                aria-hidden
              >
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1 md:flex md:items-baseline md:gap-8">
                <h3 className="font-semibold text-palette-ink text-[17px] tracking-tight md:w-64 md:shrink-0 md:text-xl">
                  {pillar.title}
                </h3>
                <p className="mt-1.5 text-[14px] text-palette-ink font-light leading-[1.6] opacity-90 md:mt-0 md:text-[15px]">
                  {pillar.description}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
