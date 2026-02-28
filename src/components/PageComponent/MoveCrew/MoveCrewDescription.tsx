'use client'
import { motion } from 'framer-motion';

const paragraphs = [
  'Nacimos para colgarnos, lanzar, caminar kilómetros y para explorar el suelo. Nuestra biología se forjó en la tracción, en la rotación y en la capacidad de mover nuestro propio peso. Un cuerpo en movimiento conoce, encarna y vive.',
  'Nunca estuvo tan de moda entrenar como máquinas aisladas: La mayoría de las rutinas ignoran cómo funciona nuestra estructura, sin considerar que el cuerpo responde, se adapta y esa es la base para una vida plena.',
  'Por eso creé la Move Crew. Es un sistema de Coherencia para habitar tu cuerpo de nuevo. Volver al origen para recuperar esa fuerza y movilidad que perdimos por el camino.'
];

const MoveCrewDescription = () => {
  return (
    <section className="py-16 md:py-20 bg-palette-cream font-montserrat">
      <div className="w-[85%] max-w-5xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-2xl md:text-4xl font-montserrat font-semibold text-palette-ink tracking-tight mb-6"
        >
          ¿Por qué nace la Move Crew?
        </motion.h2>
        <div className="space-y-6 text-base md:text-lg text-palette-stone leading-relaxed font-light">
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
        </div>
      </div>
    </section>
  );
};

export default MoveCrewDescription;
