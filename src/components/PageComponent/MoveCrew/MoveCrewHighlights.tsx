'use client'
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
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
    title: 'Camino',
    description: 'Programa de entrenamiento mensual.'
  },
  {
    icon: PiCircleLight,
    title: 'Premios por constancia',
    description: 'Motivación, repetición, integración y más movimiento.'
  },
  {
    icon: PiTriangleLight,
    title: 'Biblioteca de Clases',
    description: 'Clases grabadas y disponibles para ver en cualquier momento.'
  },
  {
    icon: PiSquareLight,
    title: 'Comunidad de movimiento',
    description: 'No estás solo en el proceso.'
  },
  {
    icon: PiDiamondLight,
    title: 'Llamada mensual y Q&A',
    description: 'Resuelvo dudas los Jueves y en una llamada mensual.'
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
      {/* Contenedor principal de la tarjeta - paleta minimalista */}
      <motion.div
        className="relative bg-white rounded-2xl md:rounded-3xl border border-palette-stone/20 p-8 shadow-[0_4px_24px_rgba(20,20,17,0.06)] overflow-hidden h-full flex flex-col"
        whileHover={{
          boxShadow: '0 20px 40px -12px rgba(20,20,17,0.1)',
          borderColor: 'rgba(120,120,103,0.35)',
          transition: {
            type: 'spring',
            stiffness: 180,
            damping: 20,
          },
        }}
      >

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
          {/* Icono con microinteracción - paleta minimalista */}
          <motion.div
            className="mb-6 p-4 w-14 h-14 rounded-2xl bg-palette-sage/15 flex items-center justify-center border border-palette-stone/30 shadow-sm"
            whileHover={{
              scale: 1.1,
              rotate: [0, -5, 5, -5, 0],
              backgroundColor: 'rgba(172, 174, 137, 0.25)',
              borderColor: 'rgba(120, 120, 103, 0.5)',
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
              <item.icon className="w-7 h-7 text-palette-sage" />
            </motion.div>
          </motion.div>

          {/* Título con parallax */}
          <motion.h3
            className="text-xl font-montserrat font-semibold mb-3 text-palette-ink tracking-tight"
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

          {/* Descripción */}
          <motion.p
            className="text-sm md:text-base text-palette-stone leading-relaxed font-light flex-grow"
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

const CTACard = ({ index }: { index: number }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-100px' });

  const scrollToPlans = () => {
    const target = document.getElementById('move-crew-plans');
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative h-full flex md:col-span-2 lg:col-span-1"
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
      {/* Contenedor CTA - imagen + overlay estilo Hero */}
      <motion.div
        className="relative rounded-2xl md:rounded-3xl border border-palette-stone/20 overflow-hidden h-full flex flex-col shadow-[0_4px_24px_rgba(20,20,17,0.06)]"
        whileHover={{
          boxShadow: '0 20px 40px -12px rgba(20,20,17,0.1)',
          borderColor: 'rgba(120,120,103,0.35)',
          transition: { type: 'spring', stiffness: 180, damping: 20 },
        }}
      >
        <div className="absolute inset-0">
          <CldImage
            src="my_uploads/fondos/DSC01649_zdkpvr"
            alt="Move Crew"
            fill
            className="object-cover"
            loader={imageLoader}
          />
          <div className="absolute inset-0 bg-palette-deep-teal/85 md:bg-palette-ink/80" />
        </div>

        <motion.div
          className="relative z-10 flex flex-col h-full p-8 justify-between"
          initial={{ opacity: 0, y: 6 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: 0.1 + (index * 0.08), ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <motion.h3
              className="text-xl font-montserrat font-semibold mb-3 text-palette-cream tracking-tight"
              initial={{ opacity: 0, y: 4 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.2 + (index * 0.08), ease: [0.16, 1, 0.3, 1] }}
            >
              ¿Listo para empezar?
            </motion.h3>
            <motion.p
              className="text-sm md:text-base text-palette-cream/90 leading-relaxed font-light mb-6"
              initial={{ opacity: 0, y: 4 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.25 + (index * 0.08), ease: [0.16, 1, 0.3, 1] }}
            >
              Descubrí los planes disponibles y elegí el que mejor se adapte a vos.
            </motion.p>
          </div>

          <motion.button
            onClick={scrollToPlans}
            className="font-montserrat font-semibold text-sm uppercase tracking-[0.2em] rounded-full px-6 py-3 bg-palette-cream text-palette-ink border-2 border-palette-cream/80 hover:bg-white hover:border-white hover:text-palette-ink transition-all duration-200 w-full"
            initial={{ opacity: 0, y: 4 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, delay: 0.3 + (index * 0.08), ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Ver planes disponibles
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const MoveCrewHighlights = () => {
  return (
    <section className="relative py-16 md:py-20 bg-palette-cream font-montserrat">
      <div className="w-[85%] max-w-7xl mx-auto px-4">
        {/* Cabecera alineada al concepto del Hero: tagline Raleway + título Montserrat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-12 md:mb-14"
        >
  
          <p className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-stone/80 mb-2">Lo que incluye</p>
          <h2 className="text-2xl md:text-4xl font-montserrat font-semibold text-palette-ink tracking-tight">
            Todo lo que necesitás para moverte mejor
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12 items-stretch">
          {highlights.map((item, index) => (
            <HighlightCard key={item.title} item={item} index={index} />
          ))}
          {/* 6ta tarjeta con imagen de fondo y CTA */}
          <CTACard index={5} />
        </div>
      </div>
    </section>
  );
};

export default MoveCrewHighlights;
