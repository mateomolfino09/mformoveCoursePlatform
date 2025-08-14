'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const MentorshipFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿Qué es la mentoría?",
      answer: "Es un proceso de transformación guiado, con acompañamiento directo y un plan hecho a tu medida. No es solo entrenamiento, es tener un sostén en el camino, alguien que te escuche, te guíe y te desafíe a crecer en tu práctica de forma real y sostenida."
    },
    {
      question: "¿Por qué es tan cara la mentoría?",
      answer: "La mentoría no es solo un servicio, es una inversión en transformación personal. El precio refleja la atención personalizada, el tiempo dedicado exclusivamente a tu progreso, y la experiencia de Mateo Molfino. No es un producto masivo, sino un servicio para personas serias sobre su transformación."
    },
    {
      question: "¿Qué pasa si no puedo mantener el compromiso trimestral?",
      answer: "El compromiso de tres meses es clave para que el proceso tenga sentido y dé resultados. Si no podés sostenerlo ahora, está bien. Podés sumarte más adelante, cuando sientas que estás en condiciones de aprovecharlo de verdad."
    },
    {
      question: "¿Cómo funciona el seguimiento por video?",
      answer: "Envías videos de tu práctica regularmente según tu plan. Mateo revisa cada video personalmente, proporciona feedback detallado, y ajusta tu programa según tu progreso. Es como tener una sesión de entrenamiento personal, pero de forma asíncrona y más frecuente."
    },
    {
      question: "¿Puedo cambiar de plan durante el trimestre?",
      answer: "Los cambios de plan se evalúan caso por caso. Si tu progreso y compromiso justifican un nivel superior, podemos hacer la transición. Sin embargo, recomendamos completar al menos un trimestre en tu plan inicial para establecer una base sólida."
    },
    {
      question: "¿Qué incluye la formación teórica?",
      answer: "La formación teórica incluye conceptos de anatomía funcional, biomecánica aplicada, principios del movimiento consciente, y metodologías de enseñanza (para el nivel avanzado). Es educación que te permite entender el 'por qué' detrás de cada movimiento."
    },
    {
      question: "¿Hay garantía de resultados?",
      answer: "Garantizamos nuestro compromiso, atención y metodología. Los resultados específicos dependen de tu consistencia y aplicación. La mentoría te da todas las herramientas, pero tú debes poner el trabajo. Es una colaboración, no un servicio pasivo."
    },
    {
      question: "¿Puedo acceder a la comunidad?",
      answer: "Sí, todos los planes de mentoría incluyen acceso a la comunidad exclusiva de MForMove. Además, la mentoría te permite tener un seguimiento más cercano y acompañamiento directo, para que no te sientas solo en el proceso."
    },
    {
      question: "¿Qué pasa después del trimestre?",
      answer: "Al terminar el trimestre, revisamos tus avances y próximos objetivos para decidir juntos cómo seguir. La mayoría elige continuar otro trimestre para seguir profundizando, consolidando hábitos y avanzando con acompañamiento. Esta experiencia está pensada para crecer en el tiempo, y hoy es la única forma de trabajar conmigo en profundidad."
    },
    {
      question: "¿Cómo sé si la mentoría es para mí?",
      answer: "La mentoría es para personas que quieren transformación real, no solo ejercicio. Si estás dispuesto a comprometerte con el proceso, invertir en tu desarrollo personal, y trabajar consistentemente, entonces la mentoría es para ti. Si buscas algo casual o barato, mejor empieza con la membresía."
    },
    {
      question: "¿Cuál es la política de reembolso?",
      answer: "Ofrecemos garantía del 100% bajo condiciones específicas: debes haber completado al menos 2 semanas del programa, enviado videos de práctica según lo acordado, y demostrado compromiso real con el proceso. No se aplica a casos de falta de compromiso, ausencia de comunicación, o expectativas irrealistas. La garantía protege a personas serias que no encuentran valor en nuestro servicio, no a quienes no cumplen con su parte del compromiso."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-[#F2F3F6] font-montserrat">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#234C8C' }}>
            Preguntas Frecuentes
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: '#373436' }}>
            Resolvemos las dudas más comunes sobre nuestro proceso de mentoría
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl border overflow-hidden"
              style={{ borderColor: '#B0B8C1' }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[#F2F3F6] transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold pr-4" style={{ color: '#234C8C' }}>
                  {faq.question}
                </h3>
                <ChevronDownIcon
                  className={`w-5 h-5 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
                  style={{ color: '#5fa8e9' }}
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
                    <div className="px-6 pb-4">
                      <p className="leading-relaxed" style={{ color: '#373436' }}>
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        {/* Eliminado el CTA de contacto por decisión del usuario */}
      </div>
    </section>
  );
};

export default MentorshipFAQ; 