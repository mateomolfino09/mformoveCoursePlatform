'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import {
  landingCardBody,
  landingEyebrow,
  landingFaqContainer,
  landingSectionBodyMuted,
  landingSectionTitle,
} from '../../../constants/landingSectionDesign';

const faqs = [
  {
    question: '¿Qué es exactamente la mentoría?',
    answer:
      'Es un proceso de acompañamiento personalizado donde trabajamos juntos durante tres meses. Recibís un plan adaptado a tu práctica, feedback sobre tus videos, llamadas para ajustar el proceso y espacios de formación sobre el cuerpo y el movimiento. El objetivo no es solo entrenar, sino construir una práctica más consciente, sólida y sostenible.',
  },
  {
    question: '¿Cuánto cuesta?',
    answer:
      'Los valores dependen del nivel de acompañamiento que elijas. Podés consultarlos en la sección de planes y elegir la modalidad que mejor se adapte a tu proceso.',
  },
  {
    question: '¿Por qué tres meses mínimo?',
    answer:
      'El movimiento necesita tiempo, práctica y continuidad. Tres meses permiten construir una base sólida, ajustar el proceso y observar cambios reales. En el plan mensual abonás mes a mes, pero el compromiso mínimo sigue siendo de tres meses.',
  },
  {
    question: '¿Cómo funciona el feedback de videos?',
    answer:
      'Enviás videos de tu práctica y los reviso personalmente. A partir de eso realizamos correcciones, ajustes y nuevas propuestas para acompañar tu evolución sin depender de encuentros constantes.',
  },
  {
    question: '¿Puedo cambiar de plan?',
    answer:
      'Sí. Lo evaluamos según tus necesidades y objetivos. La idea es encontrar el formato de acompañamiento que mejor funcione para tu proceso.',
  },
  {
    question: '¿Qué incluye la formación teórica?',
    answer:
      'Trabajamos conceptos relacionados con anatomía funcional, biomecánica, aprendizaje motor y principios del movimiento. La intención es comprender el qué, el cómo y el por qué detrás de la práctica.',
  },
  {
    question: '¿Garantizan resultados?',
    answer:
      'No podemos garantizar resultados específicos, porque cada proceso depende del contexto y la constancia de cada persona. Lo que sí garantizamos es acompañamiento cercano, atención personalizada y una metodología construida a lo largo de años de práctica y enseñanza.',
  },
  {
    question: '¿Incluye acceso a la comunidad?',
    answer:
      'Sí. Todos los planes incluyen acceso a la comunidad de MForMove, además del seguimiento cercano y personalizado de la mentoría.',
  },
  {
    question: '¿Qué pasa después del trimestre?',
    answer:
      'Al finalizar el trimestre revisamos el proceso y decidimos juntos cómo seguir. Algunas personas continúan profundizando la práctica y otras siguen su camino de forma más autónoma.',
  },
  {
    question: '¿Es para mí?',
    answer:
      'Si buscás profundizar tu práctica, trabajar con acompañamiento personalizado y comprometerte con un proceso de varios meses, probablemente sí. Si preferís una propuesta más flexible o exploratoria, la membresía puede ser una mejor opción.',
  },
  {
    question: '¿Política de cancelación?',
    answer:
      'El plan mensual se abona mes a mes, con un compromiso mínimo de tres meses. Pasado ese período, podés evaluar continuar o dar por cerrado el ciclo. Recomendamos sostener el proceso durante al menos tres meses para poder construir una base sólida y observar cambios significativos.',
  },
];

export default function MentorshipFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="border-t border-palette-stone/18 bg-palette-cream pb-16 pt-12 text-left font-montserrat md:pb-20 md:pt-14">
      <div className="mx-auto w-[92%] max-w-6xl px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-36px' }}
          className="mb-10 mr-auto max-w-2xl md:mb-12"
        >
          <p className={landingEyebrow}>Preguntas frecuentes</p>
          <h2 className={landingSectionTitle}>
            Antes de escribirme
          </h2>
          <p className={landingSectionBodyMuted}>
            Respuestas directas a lo que suele aparecer cuando alguien está evaluando si esto es para su momento.
          </p>
        </motion.div>

        <div className={landingFaqContainer}>
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.32 }}
                viewport={{ once: true, margin: '-20px' }}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={open}
                  className="flex w-full items-start gap-4 px-4 py-4 text-left transition-colors hover:bg-palette-cream/50 sm:px-5 sm:py-5"
                >
                  <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug tracking-tight text-palette-ink md:text-[17px]">
                    {faq.question}
                  </span>
                  <ChevronDownIcon
                    className={`mt-0.5 h-5 w-5 shrink-0 text-palette-ink/45 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className={`${landingCardBody} px-4 pb-4 pt-0 sm:px-5 sm:pb-5`}>
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
