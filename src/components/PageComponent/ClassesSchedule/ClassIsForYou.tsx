'use client'
import React from 'react';
import { motion } from 'framer-motion';

interface ClassIsForYouProps {
  classType: 'comun' | 'personalizado';
}

const commonPositives = [
  'Buscas movimiento compartido y energía grupal.',
  'Valorás la práctica colectiva y el aprendizaje del grupo.',
  'Te motiva encontrarte con otros y explorar juntos.',
  'Disfrutás de clases estructuradas con horarios fijos.',
];

const commonNegatives = [
  'Buscas un programa 100% personalizado para ti.',
  'Necesitas seguimiento individual y ajustes constantes.',
  'Preferís clases 1 a 1 con feedback personalizado.',
  'Querés un plan diseñado específicamente para tu cuerpo.',
];

const personalizedPositives = [
  'Buscas un programa diseñado específicamente para tu cuerpo.',
  'Valorás el seguimiento personal y la atención 1 a 1.',
  'Te motiva tener una clase en vivo semanal adaptada a ti.',
  'Querés movimiento que evoluciona según tu proceso.',
];

const personalizedNegatives = [
  'Buscas solo clases grupales sin personalización.',
  'No querés compromiso semanal ni seguimiento.',
  'Preferís horarios flexibles sin estructura fija.',
  'No te interesa un proceso personalizado a largo plazo.',
];


const ClassIsForYou = ({ classType }: ClassIsForYouProps) => {
  const positives = classType === 'personalizado' ? personalizedPositives : commonPositives;
  const negatives = classType === 'personalizado' ? personalizedNegatives : commonNegatives;
  
  const introText = classType === 'personalizado'
    ? 'Esta modalidad está pensada para personas que buscan un proceso profundo y personalizado presencial. Te lo digo directo: no es una clase grupal. Es tu programa, tu seguimiento, tu evolución en persona. Si buscás comprometerte con tu movimiento de forma individual, presencialmente, seguí leyendo. Si preferís algo más grupal, quizás las clases comunes sean mejor para vos. No te quiero hacer perder el tiempo, si querés invertirlo en un proceso personal presencial, seguí. Si no, mejor que lo sepas desde el principio.'
    : 'Esta modalidad está pensada para quienes disfrutan del movimiento compartido presencial. Te lo digo claro: no es un programa personalizado. Es práctica grupal en persona, energía colectiva, aprendizaje del grupo en nuestro espacio físico. Si buscás movimiento junto a otros, presencialmente, seguí leyendo. Si necesitás algo más individual, las clases personalizadas pueden ser una mejor opción. No es para cualquiera, es para quienes valoran el movimiento compartido y la energía del grupo cuando estamos juntos.';

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

  const cardVariantsImproved = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      },
    },
  };

  return (
    <section className="py-20 bg-white font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-gray-500 mb-3">Para quién es</p>
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">
            {classType === 'personalizado' ? 'Un proceso pensado para ti' : 'Un espacio pensado para el grupo'}
          </h2>
          <p className="text-base md:text-xl text-gray-600 font-light max-w-3xl leading-relaxed">
            {introText}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariantsImproved}
              transition={{ delay: i * 0.1 }}
            >
              <div className="bg-gray-50 border border-black/5 rounded-2xl p-8 md:p-10 flex flex-col h-full hover:bg-gray-100/50 hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-black">
                  {i === 0 ? 'Entrenar conmigo es para ti si…' : 'No es para ti si…'}
                </h3>
                <ul className="space-y-4 flex-grow">
                  {(i === 0 ? positives : negatives).map((item, idx) => (
                    <motion.li 
                      key={idx} 
                      className="flex items-start gap-3 text-gray-700 text-sm md:text-base font-light leading-relaxed"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${i === 0 ? 'bg-black' : 'bg-gray-400'}`}></span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-center bg-gray-50 rounded-2xl p-8 border border-black/10"
        >
          <p className="text-lg md:text-xl text-gray-700 font-light mb-6 max-w-2xl mx-auto">
            Si te identificás con el primer perfil, estas clases pueden ser exactamente lo que necesitás. 
            Te invito a ver los horarios disponibles.
          </p>
          <button
            onClick={() => {
              const element = document.getElementById('class-schedules');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-black text-white px-10 py-4 rounded-xl font-semibold text-base md:text-lg hover:bg-gray-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            Ver horarios disponibles
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ClassIsForYou;

