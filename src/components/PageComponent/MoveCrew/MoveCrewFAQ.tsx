'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const faqs = [
  {
    question: '¿Qué diferencia a Move Crew de la mentoría?',
    answer:
      'En la mentoría voy 1:1 y personalizo todo. Move Crew es grupal: seguís el Camino semanal, con contenido nuevo todas las semanas, U.C. y soporte asíncrono. Ideal si querés avanzar acompañado sin un plan a medida.'
  },
  {
    question: '¿Necesito experiencia previa?',
    answer:
      'No. Uso el Triple Filtro de Exploración: hay opciones para principiantes, intermedios y avanzados. Ajustás intensidad y progresiones según tu nivel.'
  },
  {
    question: '¿Cuánto tiempo tengo que dedicar?',
    answer:
      '2 horas semanales maximo. Las clases duran 15-25 minutos; podés repartirlas en la semana y cerrar con un bloque un poco más largo si querés.'
  },
  {
    question: '¿Cómo funciona el soporte?',
    answer:
      'Es asíncrono por WhatsApp: preguntas rápidas y feedback sin atarte a horarios. Además, cada miércoles grabo un Q&A para responder lo que vaya surgiendo.'
  },
  {
    question: '¿Qué pasa si me pierdo una semana?',
    answer:
      'Las semanas quedan guardadas. Si frenás, retomás donde te quedaste. Reinicio ciclos para que puedas volver sin culpa.'
  },
  {
    question: '¿Cómo funcionan las U.C. y los canjes?',
    answer:
      'Una semana completada del Camino = 1 U.C. Acumulalas y canjealas por programas o merch. A los 3 meses sostenidos ganás la insignia “Núcleo Estable”.'
  },
  {
    question: '¿Hay garantía?',
    answer:
      'Sí, ofrezco garantía de devolución de 30 días, pero con condiciones claras para asegurar que realmente intentaste el programa. Para acceder a la devolución necesitás: haber completado al menos 6 sesiones de entrenamiento (2 por semana durante 3 semanas), haber participado activamente en la comunidad al menos 3 veces, y demostrar que seguiste las planificaciones propuestas. Si cumplís estos mínimos y aún así no te funciona, te devuelvo el dinero sin preguntas. La garantía es para proteger a quienes realmente intentan, no para quienes quieren probar gratis.'
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
