'use client'
import { motion } from 'framer-motion';

const paragraphs = [
  'Si trabajás sentado, te sentís rígido y te duele el cuerpo, no te falta “fuerza de voluntad”. Te falta estructura, calma y un camino claro.',
  'Cuerpo autónomo es una metodología de soberanía física: recuperar arquitectura corporal (postura), regular tensión y volver a moverte con libertad y sin dolor.',
  'No buscamos acumular ejercicios. Buscamos entender tu cuerpo y aprender a practicar de forma inteligente: respiración, base (pies), eje (columna), capacidades y expresión.',
  'La meta es simple y concreta: menos dolor, más fuerza útil, más calma y una práctica que puedas sostener sin depender de una suscripción eterna.',
  'Cuando volvés a sostenerte con menos esfuerzo, el movimiento deja de ser una batalla. Se vuelve alivio, confianza y juego.'
];

const CourseDescription = () => {
  return (
    <section className="relative isolate overflow-hidden py-12 md:py-14 bg-palette-cream font-montserrat">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_50%,rgba(143,157,179,0.14),transparent_55%)]" aria-hidden />
      <div className="relative w-[85%] max-w-6xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mc-text-depth-light-title text-[1.85rem] md:text-5xl lg:text-[2.65rem] font-montserrat font-semibold text-palette-ink tracking-tight mb-6 leading-[1.08]"
        >
          ¿Por qué nace Cuerpo autónomo?
        </motion.h2>
        <div className="space-y-5 text-lg md:text-xl text-palette-stone leading-relaxed font-light [&>p]:mc-text-depth-light">
          {paragraphs.map((paragraph, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {paragraph}
            </motion.p>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            viewport={{ once: true }}
            className="pt-2"
          >
            <p className="mc-text-depth-light font-raleway italic text-palette-ink/85 text-lg md:text-xl leading-relaxed">
              Si esto describe lo que te pasa, mirá la oferta del programa y elegí la forma de pago.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CourseDescription;
