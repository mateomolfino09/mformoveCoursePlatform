'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useCursoLanding } from './CursoLandingContext';
import CourseDarkSectionBackground from './CourseDarkSectionBackground';
import {
  landingEyebrowDark,
  landingFadeUp,
  landingSectionBodyDark,
  landingSectionContainer,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';

const CourseFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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
      className="relative isolate overflow-hidden border-t border-palette-stone/40 bg-palette-ink pb-16 pt-12 font-montserrat md:pb-20 md:pt-14"
      id={faqSectionId}
      aria-labelledby="course-faq-heading"
    >
      <CourseDarkSectionBackground />

      <div className={`relative z-10 ${landingSectionContainer}`}>
        <motion.div
          {...landingFadeUp}
          className="mb-10 mr-auto max-w-2xl md:mb-12"
        >
          <p className={landingEyebrowDark}>Preguntas frecuentes</p>
          <h2 id="course-faq-heading" className={landingSectionTitleDark}>
            {cursoConfig.faq.titulo}
          </h2>
          {cursoConfig.faq.intro ? (
            <p className={landingSectionBodyDark}>{cursoConfig.faq.intro}</p>
          ) : null}
        </motion.div>

        <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-palette-stone/45 bg-[#1a1a16] text-left shadow-[0_20px_50px_-28px_rgba(0,0,0,0.55)] ring-1 ring-black/30">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            const isLast = index === faqs.length - 1;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.32 }}
                viewport={{ once: true, margin: '-20px' }}
                className={isLast ? undefined : 'border-b border-palette-stone/35'}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={open}
                  className="flex w-full items-start gap-4 px-4 py-4 text-left transition-colors hover:bg-palette-stone/15 sm:px-5 sm:py-5"
                >
                  <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug tracking-tight text-palette-cream md:text-[17px]">
                    {faq.question}
                  </span>
                  <ChevronDownIcon
                    className={`mt-0.5 h-5 w-5 shrink-0 text-palette-stone transition-transform duration-200 ${open ? 'rotate-180 text-palette-cream/70' : ''}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-palette-stone/25 px-4 pb-4 pt-3 text-[14px] font-normal leading-[1.7] text-palette-cream/75 sm:px-5 sm:pb-5 sm:pt-3.5 sm:text-[15px] sm:leading-[1.68]">
                        {faq.answer}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CourseFAQ;
