'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { InPersonClass } from '../../../../typings';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';

interface CommonClassIntroProps {
  classData?: InPersonClass;
}

const CommonClassIntro = ({ classData }: CommonClassIntroProps) => {
  return (
    <section className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Imagen de fondo - solo desktop */}
      <div className="absolute inset-0 hidden sm:block">
        <CldImage
          src="my_uploads/plaza/DSC03365_y5bgqb"
          alt="Banner de clases comunes"
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
            Clases Comunes
          </h1>
          <motion.p 
            className="text-lg md:text-xl lg:text-2xl text-gray-200 font-montserrat mb-6 md:mb-8 max-w-4xl mx-auto leading-relaxed drop-shadow-lg font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Movimiento compartido. Energía colectiva. Te invito a moverte con otros en persona, a encontrarte en el grupo, 
            a construir la práctica entre todos en nuestro espacio físico.
          </motion.p>
          <motion.p 
            className="text-base md:text-lg text-gray-300 font-montserrat max-w-3xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            No es solo hacer ejercicio. Es encontrarte con otros en el estudio, explorar juntos, aprender del grupo. 
            Es movimiento que se construye entre todos en persona porque creo que el grupo tiene su propia magia cuando estamos juntos.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default CommonClassIntro;

