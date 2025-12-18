'use client'
import { motion } from 'framer-motion';

const positives = [
  'Querés volver a moverte sin dolor y sin sentirte oxidado/a.',
  'Preferís prácticas guiadas pero flexibles, que puedas adaptar a tus tiempos.',
  'Buscás claridad para sostener el hábito y aprender a cuidar tu cuerpo.',
  'Te motiva formar parte de una comunidad que comparte el movimiento.',
  'No te sobra el tiempo para moverte, solo necesitás 2 o 3 veces por semana.'
];

const negatives = [
  'Estás buscando un abordaje hiper personalizado o mentoría privada.',
  'Necesitás que alguien te supervise cada sesión de entrenamiento.',
  'Querés resultados mágicos sin moverte al menos 2 a 3 veces por semana.',
  'Preferís entrenamientos largos o complejos en lugar de bloques claros y accesibles.'
];

const MoveCrewIsForYou = () => {
  // Ícono para lista: gorila para positivos, línea de negación para negativos
  const ListIcon = ({ isPositive }: { isPositive: boolean }) => {
    if (isPositive) {
      return (
        <svg 
          viewBox="0 0 262.309 262.309" 
          className="w-4 h-4 flex-shrink-0 opacity-80 text-black"
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
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 relative">
        <svg viewBox="0 0 24 24" className="w-3 h-3 text-gray-400">
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
          <h2 className="text-3xl md:text-5xl font-bold text-black">Un espacio pensado para que obtener resultados parezca fácil</h2>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl font-light mt-4">
            Acompaño a personas que quieren mejorar su movilidad, sentirse fuertes y disfrutar del movimiento. Valoro tu tiempo asi que, si necesitás algo distinto, te lo digo de una.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {[{ title: 'La Move Crew es para vos si…', list: positives, isPositive: true }, { title: 'No es para vos si…', list: negatives, isPositive: false }].map((section) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-gray-50 via-amber-50/20 to-orange-50/10 border border-amber-200/30 rounded-3xl p-8 overflow-hidden"
            >
              {/* Decoración sutil de fondo */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-semibold mb-6 text-black">{section.title}</h3>
                <ul className="space-y-4 text-gray-700 text-sm md:text-base font-light">
                  {section.list.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <ListIcon isPositive={section.isPositive} />
                      <span>{item}</span>
                    </li>
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
          className="relative text-center bg-gradient-to-br from-amber-50/40 via-orange-50/20 to-rose-50/20 rounded-3xl p-8 border border-amber-200/40 overflow-hidden"
        >
          {/* Decoración sutil de fondo */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-900 font-light mb-4 max-w-3xl mx-auto leading-relaxed">
              Si te identificás con el primer perfil,{' '}
              <span className="font-semibold text-gray-900">Move Crew puede ser exactamente lo que necesitás</span>.
            </p>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 font-light mb-8 max-w-2xl mx-auto">
              Te invito a ver los planes disponibles.
            </p>
            <button
              onClick={() => {
                const element = document.getElementById('move-crew-plans');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative bg-black text-white px-8 py-3.5 rounded-full font-medium text-base md:text-lg tracking-wide hover:bg-gray-900 transition-all duration-300 border border-black/10 hover:border-black/20 shadow-sm hover:shadow-md"
            >
              <span className="relative z-10">Ver planes disponibles</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-orange-500/0 group-hover:from-amber-500/10 group-hover:via-amber-500/15 group-hover:to-orange-500/10 transition-all duration-300 opacity-0 group-hover:opacity-100" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MoveCrewIsForYou;
