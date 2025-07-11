'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { CldImage } from 'next-cloudinary';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.15 + 0.4,
      ease: 'easeOut',
    },
  }),
};

const MentorshipCTA = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-[#234C8C] via-black to-black font-montserrat relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/* Imagen mobile */}
        <CldImage
          src="my_uploads/plaza/IMG_0311_ytnskw"
          width={800}
          height={1200}
          alt="Mentoría fondo inspirador mobile"
          className="absolute inset-0 w-full h-full object-cover object-center z-0 block md:hidden"
          style={{ filter: 'brightness(0.45) blur(1.5px)', objectPosition: 'center 60%' }}
        />
        {/* Imagen desktop/tablet */}
        <CldImage
          src="my_uploads/plaza/DSC03350_vgjrrh"
          width={1200}
          height={600}
          alt="Mentoría fondo inspirador"
          className="absolute inset-0 w-full h-full object-cover object-center z-0 hidden md:block"
          style={{ filter: 'brightness(0.45) blur(1.5px)', objectPosition: 'center 60%' }}
        />
      </div>
      {/* Halo decorativo */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#234C8C]/30 blur-3xl rounded-full z-0" />
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Main CTA */}
          <div className="bg-[#181A1B]/80 backdrop-blur-xl rounded-3xl p-4 md:p-12 border border-[#234C8C]/30 shadow-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-8 flex flex-col items-center"
            >
              <h2 className="text-2xl sm:text-3xl md:text-6xl font-bold mb-6 text-white tracking-tight">
                ¿Listo para tu <span style={{ color: '#5fa8e9' }}>Transformación</span>?
              </h2>
              <p className="text-base sm:text-lg md:text-2xl text-white/80 mb-8 max-w-2xl md:max-w-4xl mx-auto leading-relaxed">
                Este no es solo otro programa de entrenamiento. Es una inversión en tu <span style={{ color: '#5fa8e9' }} className="font-semibold">transformación personal</span> a través del movimiento.
              </p>
            </motion.div>

            {/* Value Proposition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="bg-[#23272F]/70 backdrop-blur-md rounded-xl p-6 border border-[#234C8C]/20 shadow-xl flex flex-col items-center"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={cardVariants}
                  custom={i}
                >
                  <h3 className="text-lg font-semibold text-white mb-2 tracking-wide">
                    {i === 0 && 'Plan Único'}
                    {i === 1 && 'Acompañamiento 1:1'}
                    {i === 2 && 'Compromiso Real'}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {i === 0 && 'Diseñado específicamente para tu cuerpo y objetivos'}
                    {i === 1 && 'Seguimiento directo con Mateo Molfino'}
                    {i === 2 && 'Para personas serias sobre su transformación'}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center w-full"
            >
              <button 
                onClick={() => {
                  const element = document.getElementById('mentorship-plans');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-[#234C8C] hover:bg-[#5fa8e9] text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_20px_2px_#234C8C55] flex items-center justify-center space-x-2"
              >
                <span>Ver Planes</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>

              <button className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white font-semibold py-4 px-8 rounded-full text-lg hover:bg-[#234C8C]/20 transition-all duration-300 border border-[#234C8C]/30 flex items-center justify-center space-x-2">
                <span>Agendar Consulta</span>
              </button>
            </motion.div>
          </div>

          {/* Bottom Message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <div className="bg-[#181A1B]/80 backdrop-blur-xl rounded-2xl p-8 border border-[#234C8C]/20">
              <p className="text-lg text-white/80 italic mb-4">
                "La mentoría no es para todos. Es para quienes están listos para <span style={{ color: '#5fa8e9' }} className="font-semibold">invertir en sí mismos</span> y comprometerse con el proceso de transformación."
              </p>
              <p className="text-white/60 text-sm">— Mateo Molfino</p>
              <div className="mt-6 pt-6 border-t border-[#234C8C]/20">
                <p className="text-white/90 text-base font-medium">
                  <span style={{ color: '#5fa8e9' }} className="font-bold">Garantía del 100%:</span> Si no estás completamente satisfecho con el servicio, te reembolsamos el 100% de tu inversión.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default MentorshipCTA; 