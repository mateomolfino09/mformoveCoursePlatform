'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  landingEyebrowDark,
  landingSectionBodyDark,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';

const includes = [
  {
    title: 'Programa personalizado',
    description:
      'Un plan de entrenamiento adaptado a tus objetivos, experiencia, disponibilidad y momento actual de la práctica.',
  },
  {
    title: 'Ajustes quincenales',
    description:
      'Cada dos semanas revisamos el proceso y realizamos los cambios necesarios para que el entrenamiento siga teniendo sentido y dirección.',
  },
  {
    title: 'Llamadas de mentoría',
    description:
      'Una llamada mensual para profundizar en los principios del movimiento, entender el qué, el cómo y el por qué de la práctica, y desarrollar una mirada más consciente y crítica sobre el cuerpo.',
  },
] as const;

const MentorshipIncludes = () => {
  return (
    <section className="relative overflow-hidden bg-palette-ink font-montserrat">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-stone/25 to-transparent" />
      <div className="pointer-events-none absolute -top-32 right-[-20%] h-72 w-72 rounded-full bg-palette-sage/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-[-15%] h-96 w-96 rounded-full bg-palette-stone/[0.06] blur-3xl" />

      <div className="relative mx-auto my-12 md:my-0 w-[92%] max-w-6xl px-3 py-18 sm:px-4 md:py-24">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-50px' }}
        >
          <p className={landingEyebrowDark}>Lo que vas a recibir</p>
          <h2 className={landingSectionTitleDark}>
            Qué incluye el acompañamiento
          </h2>
          <p className={`${landingSectionBodyDark} max-w-2xl`}>
            Herramientas y espacios diseñados para acompañar tu proceso, profundizar la práctica y avanzar con claridad
            en tus objetivos.
          </p>
        </motion.div>

        <motion.ul
          role="list"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-10 max-w-4xl border-t border-white/10 md:mt-12"
        >
          {includes.map((item, index) => (
            <motion.li
              key={item.title}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid gap-3 border-b border-white/[0.08] py-6 md:grid-cols-[4.5rem_1fr] md:items-start md:gap-8 md:py-8"
            >
              <span
                aria-hidden
                className="font-montserrat text-sm font-semibold tabular-nums tracking-wide text-palette-sage md:pt-0.5 md:text-base"
              >
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <h3 className="text-[1.1rem] font-semibold tracking-tight text-palette-cream md:text-[1.25rem] lg:text-[1.35rem]">
                  {item.title}
                </h3>
                <p className={`${landingSectionBodyDark} mt-2`}>
                  {item.description}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        <motion.div
          className="mt-14 max-w-3xl md:mt-20"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-40px' }}
        >
          <p className="border-l-2 border-palette-sage pl-5 font-semibold leading-[1.2] tracking-tight text-palette-cream/65 text-[1.25rem] md:pl-6 md:text-[1.75rem]">
            No se trata solo de desarrollar formas.
            <span className="mt-2 block text-palette-cream">
              Se trata de construir una práctica{' '}
              <span className="text-palette-sage">propia, sostenible y con sentido</span>.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default MentorshipIncludes;
