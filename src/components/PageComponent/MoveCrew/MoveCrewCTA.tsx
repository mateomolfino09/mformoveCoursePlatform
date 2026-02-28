'use client'
import { motion } from 'framer-motion';

const MoveCrewCTA = () => {
  const scrollToPlans = () => {
    const element = document.getElementById('move-crew-plans');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 md:py-20 bg-palette-ink text-palette-cream font-montserrat">
      <div className="w-[85%] max-w-5xl mx-auto px-4 text-center md:text-left">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-cream/70 mb-4"
        >
          ¿listo para moverte distinto?
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-2xl md:text-4xl font-montserrat font-semibold text-palette-cream leading-tight mb-6 tracking-tight"
        >
          Move Crew es la estructura que necesitás para empezar (y no parar).
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="font-raleway italic text-palette-cream/85 text-base md:text-lg max-w-3xl mx-auto md:mx-0 font-light mb-10 leading-relaxed"
        >
          La plataforma ya está activa. Si te sentís listo para hacer un cambio y querés volver a moverte con libertad. Te espero adentro. Nos vemos en movimiento.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          viewport={{ once: true }}
          onClick={scrollToPlans}
          className="font-montserrat font-semibold text-sm uppercase tracking-[0.2em] rounded-full px-6 py-3 bg-palette-cream text-palette-ink border-2 border-palette-cream/80 hover:bg-white hover:border-white transition-all duration-200"
        >
          Ver opciones y sumarme
        </motion.button>
      </div>
    </section>
  );
};

export default MoveCrewCTA;
