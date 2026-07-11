'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useCursoLanding } from './CursoLandingContext';
import {
  landingEyebrow,
  landingFadeUp,
  landingFaqContainer,
  landingSectionBodyMuted,
  landingSectionContainer,
  landingSectionShell,
  landingSectionTitle,
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
      className={`${landingSectionShell} pb-16 pt-12 md:pb-20 md:pt-14`}
      id={faqSectionId}
      aria-labelledby="course-faq-heading"
    >
      <div className={landingSectionContainer}>
        <motion.div
          {...landingFadeUp}
          className="mb-10 mr-auto max-w-2xl md:mb-12"
        >
          <p className={landingEyebrow}>Preguntas frecuentes</p>
          <h2 id="course-faq-heading" className={landingSectionTitle}>
            {cursoConfig.faq.titulo}
          </h2>
          {cursoConfig.faq.intro ? (
            <p className={landingSectionBodyMuted}>{cursoConfig.faq.intro}</p>
          ) : null}
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
                  {open ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 pt-0 text-[14px] font-normal leading-[1.7] text-palette-ink/90 sm:px-5 sm:pb-5 sm:text-[15px] sm:leading-[1.68]">
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
