'use client'
import { motion } from 'framer-motion';

const paragraphs = [
  'Nacimos para colgarnos, lanzar, caminar kilómetros y para explorar el suelo. Nuestra biología se forjó en la tracción, en la rotación y en la capacidad de mover nuestro propio peso. Un cuerpo en movimiento conoce, encarna y vive.',
  'Nunca estuvo tan de moda entrenar como máquinas aisladas. La mayoría de las rutinas ignoran cómo funciona nuestra estructura, sin considerar que el cuerpo responde, se adapta y esa es la base para una vida plena.',
  'Cuerpo autónomo nace para salir de la idea de “los movimientos” y volver a “el movimiento”: una práctica viva que pone el foco en el individuo, en lo que ocurre.',
  'Importa el movimiento, sí, pero más todavía las relaciones vivas que generamos compartiendo la práctica. En ese intercambio no solo repetimos: nos regulamos, nos escuchamos y expandimos posibilidades.',
  'Más que adaptarnos, nos deslizamos conservando el equilibrio, nos regeneramos, autoemergemos.',
  'Y entonces aparecen las expresiones: baile, lucha, locomociones. No como objetivos en sí, sino como formas que le damos a la disponibilidad que crece cuando practicamos en colectivo.'
];

const MoveCrewDescription = () => {
  return (
    <section className="py-16 md:py-20 bg-palette-cream font-montserrat">
      <div className="w-[85%] max-w-6xl mx-auto px-4 text-left">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-2xl md:text-4xl font-montserrat font-semibold text-palette-ink tracking-tight mb-6"
        >
          ¿Por qué nace Cuerpo autónomo?
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

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            viewport={{ once: true }}
            className="pt-4"
          >
            <p className="font-raleway italic text-palette-ink/80 text-base md:text-lg leading-relaxed">
              ¿Todo listo para recuperar tu autonomía? Descubrí los planes y empezá hoy mismo a construir una estructura capaz.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MoveCrewDescription;
