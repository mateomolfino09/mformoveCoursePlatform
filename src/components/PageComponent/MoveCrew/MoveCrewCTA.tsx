'use client'
import { motion } from 'framer-motion';

const MoveCrewCTA = () => {
  const scrollToPlans = () => {
    const element = document.getElementById('move-crew-plans');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-black text-white font-montserrat">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="uppercase tracking-[0.3em] text-xs md:text-sm text-white/70 mb-4"
        >
          ¿listo para moverte distinto?
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold leading-tight mb-6"
        >
          Move Crew es la estructura que necesitás para empezar (y no parar). 
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-base md:text-xl text-white/80 max-w-3xl mx-auto font-light mb-10"
        >
          Un programa guiado y accesible, diseñado para que una vida en movimiento sea la regla, no la excepción.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          viewport={{ once: true }}
          onClick={scrollToPlans}
          className="bg-gradient-to-r from-amber-400 to-orange-400 text-black px-10 py-3 rounded-2xl font-semibold text-base md:text-lg hover:from-amber-300 hover:to-orange-300 transition-all duration-300 shadow-lg shadow-amber-500/20"
        >
          Ver opciones y sumarme
        </motion.button>
      </div>
    </section>
  );
};

export default MoveCrewCTA;
