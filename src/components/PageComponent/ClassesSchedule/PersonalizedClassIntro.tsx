'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { InPersonClass } from '../../../../typings';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';

interface PersonalizedClassIntroProps {
  classData?: InPersonClass;
}

const PersonalizedClassIntro = ({ classData }: PersonalizedClassIntroProps) => {
  return (
    <section className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Imagen de fondo - solo desktop */}
      <div className="absolute inset-0 hidden sm:block">
        <CldImage
          src="my_uploads/plaza/DSC03366_ctiejt"
          alt="Banner de clases personalizadas"
          fill
          className="object-cover object-center opacity-60"
          priority
          quality={80}
          preserveTransformations
          loader={imageLoader}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      </div>
      
      {/* Contenido */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-0 sm:px-6 md:px-12 lg:px-16 py-20 md:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white font-montserrat mb-6 md:mb-8 leading-tight drop-shadow-2xl">
            Clases Personalizadas
          </h1>
          <motion.p 
            className="text-lg md:text-xl lg:text-2xl text-gray-200 font-montserrat mb-6 md:mb-8 max-w-4xl mx-auto leading-relaxed drop-shadow-lg font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Tu programa. Tu proceso. Tu movimiento. Te acompaño 1 a 1 presencialmente, una clase cada semana diseñada para ti, 
            con seguimiento personal y ajustes constantes.
          </motion.p>
          <motion.p 
            className="text-base md:text-lg text-gray-300 font-montserrat max-w-3xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Esto no es una clase grupal adaptada. Es movimiento pensado específicamente para tu cuerpo, 
            tus objetivos, tu momento. Mi compromiso es contigo, en persona, no con un grupo.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default PersonalizedClassIntro;

