'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const faqs = [
  {
    question: '¿Qué diferencia a Move Crew de la mentoría?',
    answer:
      'En la mentoría trabajo con vos solo y armo todo a tu medida. Move Crew es grupal: seguís el Camino semanal con contenido nuevo cada semana y te respondo por WhatsApp cuando necesites. Los contenidos por módulo pueden ayudarte a armar tu ruta según tu nivel y necesidades.'
  },
  {
    question: '¿Necesito experiencia previa?',
    answer:
      'No. Hay opciones para todos: si recién arrancás, si ya tenés base o si querés más desafío. Vos elegís la intensidad según cómo te sentís.'
  },
  {
    question: '¿Cuánto tiempo tengo que dedicar?',
    answer:
      'Unas 2 horas por semana como mucho. Las clases en vivo son de una hora y el material grabado es de 20 a 30 minutos; podés hacerlas cuando quieras en la semana y sumar una un poco más larga si tenés ganas.'
  },
  {
    question: '¿Cómo funciona el soporte?',
    answer:
      'Por WhatsApp: escribime cuando tengas dudas y te respondo. No hay horarios fijos.'
  },
  {
    question: '¿Qué pasa si me pierdo una semana?',
    answer:
      'Las semanas quedan guardadas. Si parás un tiempo, retomás donde te quedaste. Podés volver cuando quieras, sin culpa.'
  },
  {
    question: '¿Hay garantía?',
    answer:
      'No. La Move Crew es un programa de entrenamiento continuo y sostenible. Si no te sientes cómodo/a con el contenido, podés cambiar de plan o cancelar tu membresía en cualquier momento.'
  }
];

const MoveCrewFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-16 md:py-20 bg-palette-cream font-montserrat" id="move-crew-faq">
      <div className="w-[85%] max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-12 text-start md:text-left"
        >
          <p className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-stone/80 mb-2">Preguntas frecuentes</p>
          <h2 className="text-2xl md:text-4xl font-montserrat font-semibold text-palette-ink tracking-tight mb-4">
            Respuestas claras antes de sumarte
          </h2>
          <p className="font-raleway italic text-palette-stone text-base md:text-lg max-w-2xl mx-auto md:mx-0 leading-relaxed">
            Si todavía tenés dudas, revisá esta lista o escribime. Quiero que tomes una decisión informada.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
              className="relative bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(20,20,17,0.06)]"
            >
              <div className="relative z-10">
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-base md:text-lg font-montserrat font-medium text-palette-ink">{faq.question}</span>
                <ChevronDownIcon className={`w-5 h-5 text-palette-stone transition-transform flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-sm md:text-base text-palette-stone font-light leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoveCrewFAQ;
