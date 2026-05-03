'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const faqs = [
  {
    question: '¿Qué es exactamente la mentoría?',
    answer:
      'Es un proceso de acompañamiento personalizado donde trabajamos juntos durante tres meses. Recibís un plan adaptado a tu cuerpo, feedback sobre tus videos, llamadas para ajustar el proceso y acceso a material educativo. No es solo entrenamiento: es entender cómo moverte mejor.',
  },
  {
    question: '¿Cuánto cuesta?',
    answer:
      'Los precios varían según el nivel de acompañamiento que elijas. Podés verlos en la sección de planes. Es un servicio personalizado con atención directa, no un producto masivo, y el precio refleja eso.',
  },
  {
    question: '¿Por qué tres meses mínimo?',
    answer:
      'Porque la transformación real lleva tiempo. Tres meses permiten una base sólida, ver progreso y consolidar hábitos. Si no podés comprometerte por ese período, mejor esperá a estar listo/a.',
  },
  {
    question: '¿Cómo funciona el feedback de videos?',
    answer:
      'Enviás videos de tu práctica regularmente. Los reviso personalmente, te doy correcciones y ajusto tu programa según tu progreso. Es seguimiento constante sin necesidad de coordinar horarios cada vez.',
  },
  {
    question: '¿Puedo cambiar de plan?',
    answer:
      'Se evalúa caso por caso. Si tu progreso lo justifica, lo hablamos. Igual recomendamos completar al menos un trimestre en tu plan inicial.',
  },
  {
    question: '¿Qué incluye la formación teórica?',
    answer:
      'Anatomía funcional, biomecánica y principios del movimiento consciente: el por qué detrás de cada ejercicio. En niveles avanzados entra también metodología de enseñanza.',
  },
  {
    question: '¿Garantizan resultados?',
    answer:
      'No. Garantizamos compromiso, atención y metodología. Los resultados dependen de tu consistencia y aplicación. Te damos las herramientas; vos ponés el trabajo.',
  },
  {
    question: '¿Incluye acceso a la comunidad?',
    answer: 'Sí. Todos los planes incluyen acceso a la comunidad de MForMove más el seguimiento cercano de la mentoría.',
  },
  {
    question: '¿Qué pasa después del trimestre?',
    answer:
      'Revisamos avances y decidimos juntos si seguís. La mayoría continúa porque el proceso se profundiza con el tiempo. No hay obligación de renovar.',
  },
  {
    question: '¿Es para mí?',
    answer:
      'Si querés transformación real, podés comprometerte tres meses y trabajar con constancia, probablemente sí. Si buscás algo casual o económico, la membresía suele encajar mejor.',
  },
  {
    question: '¿Política de cancelación?',
    answer:
      'Podés cancelar cuando quieras, sin penalidades. El compromiso trimestral es el tiempo mínimo recomendado para ver resultados, no una obligación contractual rígida.',
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
          <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-palette-ink">Preguntas frecuentes</p>
          <h2 className="mt-3 text-[1.65rem] font-semibold leading-[1.1] tracking-tight text-palette-ink sm:text-[2rem] md:text-[2.2rem]">
            Antes de escribirme
          </h2>
          <p className="mt-3 text-[14px] font-light leading-[1.65] text-palette-ink opacity-90 md:text-[15px]">
            Respuestas directas a lo que suele aparecer cuando alguien está evaluando si esto es para su momento.
          </p>
        </motion.div>

        <div className="w-full max-w-3xl divide-y divide-palette-stone/16 rounded-2xl border border-palette-stone/18 bg-white/40 text-left">
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
                  <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug tracking-tight text-palette-ink sm:text-[16px]">
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
                      <p className="px-4 pb-4 pt-0 text-[13px] font-light leading-[1.7] text-palette-ink opacity-[0.92] sm:px-5 sm:pb-5 sm:text-[14px] sm:leading-[1.65]">
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
