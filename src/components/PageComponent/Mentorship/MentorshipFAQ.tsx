'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const MentorshipFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿Qué es exactamente la mentoría?",
      answer: "Es un proceso de acompañamiento personalizado donde trabajamos juntos durante tres meses. Recibís un plan adaptado a tu cuerpo, feedback sobre tus videos, llamadas para ajustar el proceso, y acceso a material educativo. No es solo entrenamiento, es entender cómo moverte mejor."
    },
    {
      question: "¿Cuánto cuesta?",
      answer: "Los precios varían según el nivel de acompañamiento que elijas. Podés verlos en la sección de planes. Es un servicio personalizado con atención directa, no un producto masivo, y el precio refleja eso."
    },
    {
      question: "¿Por qué tres meses mínimo?",
      answer: "Porque la transformación real lleva tiempo. Tres meses permite establecer una base sólida, ver progreso significativo y consolidar hábitos. Si no podés comprometerte por ese período, mejor esperá a estar listo/a."
    },
    {
      question: "¿Cómo funciona el feedback de videos?",
      answer: "Enviás videos de tu práctica regularmente. Mateo los revisa personalmente, te da correcciones detalladas y ajusta tu programa según tu progreso. Es seguimiento constante sin necesidad de coordinar horarios."
    },
    {
      question: "¿Puedo cambiar de plan?",
      answer: "Se evalúa caso por caso. Si tu progreso justifica un cambio, lo hablamos. Pero recomendamos completar al menos un trimestre en tu plan inicial."
    },
    {
      question: "¿Qué incluye la formación teórica?",
      answer: "Anatomía funcional, biomecánica, principios del movimiento consciente. Es entender el por qué detrás de cada ejercicio. En niveles avanzados incluye metodología de enseñanza."
    },
    {
      question: "¿Garantizan resultados?",
      answer: "No. Garantizamos nuestro compromiso, atención y metodología. Los resultados dependen de tu consistencia y aplicación. Te damos las herramientas, vos ponés el trabajo."
    },
    {
      question: "¿Incluye acceso a la comunidad?",
      answer: "Sí. Todos los planes incluyen acceso a la comunidad de MForMove, más el seguimiento cercano de la mentoría."
    },
    {
      question: "¿Qué pasa después del trimestre?",
      answer: "Revisamos avances y decidimos juntos si seguís. La mayoría continúa porque el proceso se profundiza con el tiempo. No hay obligación de renovar."
    },
    {
      question: "¿Es para mí?",
      answer: "Si querés transformación real, estás dispuesto/a a comprometerte tres meses y trabajar consistentemente, probablemente sí. Si buscás algo casual o económico, la membresía es mejor opción."
    },
    {
      question: "¿Política de cancelación?",
      answer: "Podés cancelar cuando quieras, sin penalidades. El compromiso es trimestral en el sentido de que es el tiempo mínimo recomendado para ver resultados, no una obligación contractual."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="pt-6 pb-10 bg-white font-montserrat">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black">
            Preguntas frecuentes
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-light max-w-3xl leading-relaxed">
            Dudas comunes sobre el proceso de mentoría
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="bg-gray-900/5 rounded-xl border border-black/10 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-900/10 transition-colors duration-200"
              >
                <h3 className="text-base md:text-lg font-medium pr-4 text-black">
                  {faq.question}
                </h3>
                <ChevronDownIcon
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 text-gray-400 ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 pt-2 border-t border-black/10">
                      <p className="text-sm md:text-base leading-relaxed text-gray-700 font-light">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorshipFAQ; 