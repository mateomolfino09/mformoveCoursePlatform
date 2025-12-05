'use client'
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  PiHexagonLight,
  PiCircleLight,
  PiTriangleLight,
  PiSquareLight,
  PiDiamondLight
} from 'react-icons/pi';

const highlights = [
  {
    icon: PiHexagonLight,
    title: 'Sesiones de entrenamiento semanales',
    description: 'Propongo sesiones cortas, largas, educativas y prácticas. Para que entiendas y sostengas tu progreso.'
  },
  {
    icon: PiCircleLight,
    title: 'Desafíos Focalizados y Aceleradores',
    description: 'Retos para romper la monotonía. Te dan un empujón de motivación para acelerar tu progreso en habilidades específicas.'
  },
  {
    icon: PiTriangleLight,
    title: 'Programas de 6 semanas',
    description: 'Recibís 3 programas completos de 6 semanas. Otros entrenadores venden cada uno a miles de dolares, yo te los incluyo.'
  },
  {
    icon: PiSquareLight,
    title: 'Acceso directo y comunidad',
    description: 'Tenés acceso al chat grupal. Te doy mi guía directa para asegurar que tu práctica semanal sea correcta, evitando errores.'
  },
  {
    icon: PiDiamondLight,
    title: 'Garantía con condiciones claras',
    description: 'Garantía de devolución de 30 días si cumplís mínimos razonables (6 sesiones completadas, participación activa en comunidad). Protege a quienes realmente intentan.'
  }
];

const HighlightCard = ({ item, index }: { item: typeof highlights[0]; index: number }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={cardRef}
      className="relative h-full flex"
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={isInView ? {
        opacity: 1,
        y: 0,
        scale: 1,
      } : {}}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.08,
      }}
      whileHover={{
        scale: 1.03,
        y: -2,
        transition: {
          type: 'spring',
          stiffness: 220,
          damping: 18,
        },
      }}
      whileTap={{
        scale: 0.96,
        transition: {
          type: 'spring',
          stiffness: 380,
          damping: 28,
        },
      }}
    >
      {/* Capa de sombra animada para profundidad */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-orange-50/20 to-rose-100/30 rounded-3xl blur-2xl opacity-0"
        animate={isInView ? {
          y: [0, -1.5, 0],
          opacity: [0, 0.4, 0],
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.2,
        }}
        whileHover={{
          opacity: 0.6,
          scale: 1.15,
        }}
      />

      {/* Contenedor principal de la tarjeta */}
      <motion.div
        className="relative bg-gradient-to-br from-white via-gray-50/50 to-amber-50/30 rounded-3xl border border-amber-200/40 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden backdrop-blur-sm h-full flex flex-col"
        animate={isInView ? {
          y: [0, -1.5, 0],
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.2,
        }}
        whileHover={{
          boxShadow: '0 24px 48px -12px rgba(251, 146, 60, 0.2)',
          borderColor: 'rgba(251, 146, 60, 0.5)',
          transition: {
            type: 'spring',
            stiffness: 180,
            damping: 20,
          },
        }}
      >
        {/* Decoración orgánica de fondo */}
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-3xl"
          animate={isInView ? {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          } : {}}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.3,
          }}
        />

        {/* Contenido con parallax interno */}
        <motion.div
          className="relative z-10 flex flex-col h-full"
          initial={{ opacity: 0, y: 6 }}
          animate={isInView ? {
            opacity: 1,
            y: 0,
          } : {}}
          transition={{
            duration: 0.35,
            delay: 0.1 + (index * 0.08),
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {/* Icono con microinteracción */}
          <motion.div
            className="mb-6 p-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100/60 via-orange-50/40 to-rose-50/50 flex items-center justify-center border border-amber-200/30 shadow-sm"
            whileHover={{
              scale: 1.1,
              rotate: [0, -5, 5, -5, 0],
              background: 'linear-gradient(to bottom right, rgba(254, 243, 199, 0.8), rgba(255, 237, 213, 0.6), rgba(255, 228, 230, 0.7))',
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 17,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? {
                opacity: 1,
                scale: 1,
              } : {}}
              transition={{
                duration: 0.3,
                delay: 0.15 + (index * 0.08),
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <item.icon className="w-7 h-7 text-amber-700" />
            </motion.div>
          </motion.div>

          {/* Título con parallax */}
          <motion.h3
            className="text-xl font-semibold mb-3 text-gray-900 tracking-tight"
            initial={{ opacity: 0, y: 4 }}
            animate={isInView ? {
              opacity: 1,
              y: 0,
            } : {}}
            transition={{
              duration: 0.3,
              delay: 0.2 + (index * 0.08),
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {item.title}
          </motion.h3>

          {/* Descripción con parallax */}
          <motion.p
            className="text-sm md:text-base text-gray-700/90 leading-relaxed font-light flex-grow"
            initial={{ opacity: 0, y: 4 }}
            animate={isInView ? {
              opacity: 1,
              y: 0,
            } : {}}
            transition={{
              duration: 0.3,
              delay: 0.25 + (index * 0.08),
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {item.description}
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const MoveCrewHighlights = () => {
  return (
    <section className="py-10 bg-gray-50 font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-gray-500 mb-3">Lo que incluye</p>
          <h2 className="text-3xl md:text-5xl font-bold text-black">Todo lo que necesitás para moverte mejor</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12 items-stretch">
          {highlights.map((item, index) => (
            <HighlightCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoveCrewHighlights;
