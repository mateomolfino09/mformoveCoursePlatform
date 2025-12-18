'use client'
import { motion } from 'framer-motion';

const paragraphs = [
  'Move Crew es mi membresía online para que dejes de sentirte rígido/a, te recuperes más rápido de lesiones, desarrolles fuerza real, domines la movilidad y te muevas sin dolor.',
  'Diseñé un método mensual que combina práctica guiada, recompensas por constancia, educación de movimiento y una comunidad privada donde semana a semana traigo contenido nuevo, desafíos y acompañamiento.',
  'No es una mentoría ni un seguimiento 1:1. Es un espacio accesible y claro donde te acompaño a avanzar sin abrumarte, sostener hábitos reales y sentirte respaldado sin depender de soluciones hiper personalizadas.'
];

const MoveCrewDescription = () => {
  return (
    <section className="py-16 bg-white text-black font-montserrat">
      <div className="max-w-5xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-6"
        >
          ¿Por qué nace la Move Crew?
        </motion.h2>
        <div className="space-y-6 text-base md:text-lg text-gray-700 leading-relaxed font-light">
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
