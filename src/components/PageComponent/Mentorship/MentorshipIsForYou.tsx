import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const positives = [
  'Buscas una transformación real y profunda.',
  'Estás dispuesto/a a comprometerte con el proceso y tu desarrollo personal.',
  'Valoras el acompañamiento 1:1 y el feedback personalizado.',
  'Querés aprender a moverte mejor y entender tu cuerpo.',
  'Te motiva formar parte de una comunidad activa y consciente.'
];

const negatives = [
  'Buscas resultados rápidos o soluciones mágicas.',
  'No estás dispuesto/a a comprometerte al menos un trimestre.',
  'Preferís entrenar solo/a sin guía ni feedback.',
  'Preferís pagar poco a un proceso de calidad.',
  'No te interesa aprender ni profundizar en el proceso.'
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.15,
      ease: 'easeOut',
    },
  }),
};

const MentorshipIsForYou = () => {
  return (
    <section className="pb-16 pt-2 bg-[#F2F3F6] font-montserrat">
      <div className="max-w-5xl mx-auto px-6">
        {/* Título principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
        </motion.div>

        <p className="text-lg text-gray-700 mb-12 text-center">
          Esta mentoría está pensada para personas <strong>realmente comprometidas con su desarrollo</strong>. No es un servicio para todos, ni para quienes buscan <strong>atajos o soluciones rápidas</strong>. Priorizamos la <strong>calidad</strong>, la <strong>dedicación</strong> y el <strong>acompañamiento cercano</strong>. Si valoras tu <strong>tiempo</strong>, <strong>energía</strong> y querés invertirlos en un proceso <strong>profundo y transformador</strong>, seguí leyendo. Si no, te ahorrarás tiempo y energía sabiendo esto desde el principio.
        </p>
        <div className="grid md:grid-cols-2 gap-10">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              custom={i}
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col h-full hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-100">
                {i === 0 ? (
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'black' }}>
                    <div className="w-8 h-8 rounded-full bg-[#234C8C]/10 flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5" style={{ color: '#234C8C' }} />
                    </div>
                    Esta mentoría es para ti si…
                  </h3>
                ) : (
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'black' }}>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <XCircleIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    No es para ti si…
                  </h3>
                )}
                <ul className="space-y-4 flex-grow">
                  {(i === 0 ? positives : negatives).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[#373436] text-base leading-relaxed">
                      {i === 0 ? (
                        <CheckCircleIcon className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#234C8C' }} />
                      ) : (
                        <XCircleIcon className="w-5 h-5 mt-1 text-gray-400 flex-shrink-0" />
                      )}
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {/* Separador decorativo al final */}
                <div className={`w-full h-1 rounded-full mt-6 ${i === 0 ? 'bg-[#234C8C]/20' : 'bg-gray-200'}`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorshipIsForYou; 