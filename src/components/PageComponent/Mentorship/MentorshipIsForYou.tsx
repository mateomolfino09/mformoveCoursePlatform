import React from 'react';
import { motion } from 'framer-motion';

const positives = [
  'Buscas explorar, mejorar y entender el movimiento.',
  'Estás dispuesto/a a comprometerte con tu proceso.',
  'Valorás el acompañamiento 1 a 1 y el feedback personalizado.',
  'Te motiva aprender, intercambiar y dialogar más que seguir una rutina vacía.',
];

const negatives = [
  'Buscas resultados mágicos.',
  'No estás dispuesto/a a comprometerte al menos un trimestre.',
  'Preferís pagar poco a sumergirte en un proceso profundo.',
  'No te interesa aprender ni profundizar.'
];

const cardVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

const MentorshipIsForYou = () => {
  // Ícono para lista: gorila para positivos, línea de negación para negativos
  const ListIcon = ({ isPositive }: { isPositive: boolean }) => {
    if (isPositive) {
      return (
        <svg 
          viewBox="0 0 262.309 262.309" 
          className="w-6 h-6 flex-shrink-0 opacity-80 text-black"
        >
          <path fill="currentColor" d="M259.483,96.3c0.312-6.277-0.907-6.465-4.359-11.17c0.596-6.163-2.919-7.843-4.802-8.157
            c-1.881-0.307-3.495-6.423-1.613-7.519c1.885-1.094,8.465-5.424-1.6-14.871c-3.289-3.144-6.916-9.1-6.916-14.9
            c0-5.802-1.727-7.061-5.183-8.472c-3.448-1.405-20.7-10.191-29.48-1.094c-8.79,9.088-21.15,27.987-23.173,28.869
            c-8.258,3.579-22.32,3.652-30.738,8.778c-8.417,5.119-15.739,25.987-30.377,29.271c-14.636,3.299-26.35-12.805-47.575-2.917
            c-21.227,9.881-43.188,49.767-43.919,63.31c-0.728,13.541-3.293,18.66-10.608,21.958c-7.326,3.299-10.981,6.583-13.911,19.031
            c-2.925,12.442-8.044,23.011-3.29,30.375c4.755,7.365,6.219,7.365,11.342,7.365c5.123,0,31.469,0,31.469,0
            c4.246,0,6.287-4.975,4.089-8.434c-2.196-3.448-12.707-6.431-5.646-13.794c7.058-7.374,23.608-19.26,27.445-25.254
            c3.883-6.066,4.708-5.176,8.159,1.257c3.452,6.428,12.232,21.947,13.644,40.459c0.158,3.926-1.094,5.766,5.49,5.766
            c6.587,0,31.368,0,31.368,0s6.431-6.078,2.668-10.471c-3.768-4.394-8.785-6.432-8.626-14.9c0.153-8.473-3.14-15.056,2.353-15.216
            c5.491-0.149,14.271-1.726,17.094-4.078c2.819-2.353,5.017-2.98,5.805,4.868c0.786,7.84,3.138,16.149-0.629,18.656
            c-3.764,2.515-9.406,7.715-6.275,14.435c3.141,6.706,3.768,6.706,8.785,6.706c5.022,0,20.864,0,20.864,0s2.823,1.6,6.27-7.651
            c3.451-9.251,11.761-35.755,10.195-53.008c-0.47-6.278,3.764-3.608,4.081-0.782c0.312,2.823,1.412,16.462,1.412,16.462
            s0.315,8.473,4.232,13.959c3.923,5.486,9.41,14.118,4.551,17.407c-4.867,3.292-5.645,5.02-5.645,7.839
            c0,2.827-0.94,5.774,4.858,5.774c5.804,0,34.976,0,34.976,0s3.296-0.432,6.586-6.706c3.297-6.27,6.12-8.158,3.452-27.125
            c-2.664-18.988-2.352-33.88-11.603-49.256c-2.512-4.076-2.824-24.301-2.824-28.543c0-4.238,4.547-3.448,7.052-2.981
            c2.512,0.475,6.122,0.163,12.708-6.898C258.225,107.592,266.853,100.848,259.483,96.3z"/>
        </svg>
      );
    }
    
    return (
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 relative">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-400">
          <path 
            d="M 6,18 Q 12,10 18,6" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    );
  };

  return (
    <section className="pb-20 pt-2 bg-white font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        {/* Título principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-12"
        >
        </motion.div>

        <p className="text-lg md:text-xl text-gray-600 font-light mb-16 max-w-5xl leading-relaxed">
          Esta mentoría está pensada para personas <strong className="text-black font-medium"> comprometidas con su desarrollo</strong>. No es un servicio para cualquiera, ni para quienes buscan <strong className="text-black font-medium">soluciones rápidas</strong>. Priorizo la <strong className="text-black font-medium">calidad</strong>, la <strong className="text-black font-medium">dedicación</strong> y el <strong className="text-black font-medium">acompañamiento cercano</strong>. No te quiero hacer perder el <strong className="text-black font-medium">tiempo</strong>, si querés invertirlo en un proceso <strong className="text-black font-medium">profundo</strong>, seguí leyendo. Si no, mejor que lo sepas desde el principio.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
            >
              <div className="bg-gray-900/5 backdrop-blur-sm rounded-2xl p-8 md:p-10 flex flex-col h-full hover:bg-gray-900/10 transition-all duration-300 border border-black/10">
                <h3 className="text-2xl md:text-3xl font-medium mb-10 text-black">
                  {i === 0 ? 'Entrenar conmigo es para ti si…' : 'No es para ti si…'}
                </h3>
                <ul className="space-y-6 flex-grow">
                  {(i === 0 ? positives : negatives).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-gray-700 text-base md:text-lg font-light leading-relaxed">
                      <ListIcon isPositive={i === 0} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorshipIsForYou; 