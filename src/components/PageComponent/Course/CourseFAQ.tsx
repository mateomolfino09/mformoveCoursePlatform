'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useCursoLanding } from './CursoLandingContext';
import { sectionMainTitle } from './courseSectionTitle';

const padX =
  'mx-auto w-full max-w-none px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-28';

const CourseFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();
  const { cursoConfig, faqSectionId } = useCursoLanding();
  const faqs = [...cursoConfig.faq.items]
    .sort((a, b) => a.orden - b.orden)
    .map((item) => ({
      question: item.pregunta,
      answer: item.respuesta,
    }));

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      className="relative isolate overflow-hidden bg-palette-cream py-14 font-montserrat text-palette-ink md:py-20 lg:py-24"
      id={faqSectionId}
      aria-labelledby="course-faq-heading"
    >
      <motion.div
        className="pointer-events-none absolute -right-[12%] top-[-18%] h-[min(420px,52vw)] w-[min(420px,72vw)] rounded-full bg-palette-steel/18 blur-[100px]"
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 18, -10, 0],
                y: [0, -14, 10, 0],
              }
        }
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="pointer-events-none absolute -left-[10%] bottom-[-22%] h-[min(360px,48vw)] w-[min(360px,64vw)] rounded-full bg-palette-sage/14 blur-[95px]"
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -12, 8, 0],
                y: [0, 12, -8, 0],
              }
        }
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,rgba(143,157,179,0.22),transparent_52%)]"
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [0.75, 1, 0.75],
              }
        }
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_82%_88%,rgba(172,174,137,0.12),transparent_48%)]"
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [0.7, 1, 0.7],
              }
        }
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <div className={`relative ${padX}`}>
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:items-start lg:gap-12 xl:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-40px' }}
            className="mx-auto max-w-3xl text-center lg:sticky lg:top-28 lg:mx-0 lg:max-w-none lg:text-left"
          >
            <h2
              id="course-faq-heading"
              className={`mc-text-depth-light-title ${sectionMainTitle} text-palette-ink`}
            >
              {cursoConfig.faq.titulo}
            </h2>
            <p className="mc-text-depth-light mt-4 max-w-2xl font-raleway text-[clamp(1rem,2.1vw,1.2rem)] font-normal leading-[1.65] text-palette-stone lg:max-w-none">
              {cursoConfig.faq.intro}
            </p>
          </motion.div>

          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:gap-3.5 lg:mx-0 lg:max-w-none">
            {faqs.map((faq, index) => {
              const open = openIndex === index;

              return (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true, margin: '-24px' }}
                  className={`overflow-hidden rounded-2xl border bg-palette-cream/92 shadow-[0_10px_36px_-18px_rgba(20,20,17,0.14)] backdrop-blur-[2px] transition-[border-color,box-shadow,background-color] duration-300 md:rounded-[1.35rem] ${
                    open
                      ? 'border-palette-steel/45 shadow-[0_22px_48px_-22px_rgba(20,20,17,0.2)]'
                      : 'border-palette-steel/22 hover:border-palette-steel/35 hover:shadow-[0_18px_44px_-20px_rgba(20,20,17,0.18)]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={open}
                    className="flex w-full items-start gap-4 px-4 py-4 text-left transition-colors duration-200 hover:bg-palette-cream sm:px-5 sm:py-5 md:gap-5"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-palette-steel/30 bg-palette-cream/90 font-montserrat text-[11px] font-semibold tabular-nums text-palette-stone">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="mc-text-depth-light-title min-w-0 flex-1 font-montserrat text-[clamp(1rem,2.2vw,1.2rem)] font-semibold leading-snug tracking-tight text-palette-ink md:leading-snug">
                      {faq.question}
                    </span>
                    <ChevronDownIcon
                      className={`mt-1 h-5 w-5 shrink-0 text-palette-steel transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <motion.div
                          initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="border-t border-palette-steel/20 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4 md:pl-[4.25rem]"
                        >
                          <p className="mc-text-depth-light max-w-[52rem] font-raleway text-[0.9375rem] font-normal leading-[1.7] text-palette-stone md:text-base md:leading-[1.68]">
                            {faq.answer}
                          </p>
                        </motion.div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseFAQ;
