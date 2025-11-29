'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const faqs = [
  {
    question: '¿Qué diferencia a Move Crew de la mentoría?',
    answer:
      'En la mentoría trabajo 100% de manera personalizada y con seguimiento 1:1. Move Crew es mi membresía grupal: te doy práctica guiada, educación simple y soporte básico, pero sin encuentros privados. Ideal si querés avanzar acompañado sin necesitar un plan a medida.'
  },
  {
    question: '¿Necesito experiencia previa?',
    answer:
      'No. Las progresiones que diseño están pensadas para todos los niveles y siempre podés ajustar la intensidad de cada bloque. Lo único que te pido es comprometerte a practicar al menos dos veces por semana.'
  },
  {
    question: '¿Cuánto tiempo tengo que dedicar?',
    answer:
      'Los bloques que propongo duran entre 20 y 45 minutos. Podés combinar sesiones cortas durante la semana y profundizar el fin de semana. La idea es que el entrenamiento se adapte a tu vida, no al revés.'
  },
  {
    question: '¿Cómo funciona la comunidad en WhatsApp?',
    answer:
      'Tenemos un canal privado donde te comparto clases nuevas, recordatorios, reflexiones y correcciones generales. También abrimos espacios para que compartas avances y hagas preguntas rápidas junto a la comunidad.'
  },
  {
    question: '¿Qué pasa si me pierdo una semana?',
    answer:
      'Las planificaciones quedan guardadas para que retomes cuando puedas. Además, cada trimestre reinicio el ciclo para que vuelvas a empezar sin culpa.'
  },
  {
    question: '¿Qué incluye el soporte básico?',
    answer:
      'Acceso a mis recordatorios, indicaciones generales y respuestas dentro de la comunidad. Si necesitás ajustes específicos o feedback técnico individual, la mentoría es la mejor opción.'
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
    <section className="py-20 bg-gray-50 font-montserrat" id="move-crew-faq">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-gray-500 mb-3">Preguntas frecuentes</p>
          <h2 className="text-3xl md:text-5xl font-bold text-black">Respuestas claras antes de sumarte</h2>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto font-light mt-4">
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
              className="relative bg-gradient-to-br from-white via-amber-50/20 to-orange-50/10 border border-amber-200/40 rounded-3xl overflow-hidden"
            >
              {/* Decoración sutil de fondo */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-2xl opacity-50" />
              
              <div className="relative z-10">
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-base md:text-lg font-medium text-black">{faq.question}</span>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
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
                    <p className="text-sm md:text-base text-gray-600 font-light leading-relaxed">{faq.answer}</p>
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
