'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ArrowTrendingUpIcon, UserGroupIcon, ShieldCheckIcon, EyeIcon } from '@heroicons/react/24/outline';

const MentorshipPhilosophy = () => {
  return (
    <section className="pt-20 pb-6 bg-[#F2F3F6] font-montserrat">
      <div className="max-w-6xl mx-auto px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 font-montserrat " style={{ color: 'black' }}>
            Metodología de Trabajo
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto font-montserrat">
            No es solo entrenamiento. Es una <b>transformación completa </b>  de tu relación con el movimiento.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Philosophy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-[#687CA8]/20 font-montserrat">
                <div className="h-1 w-full rounded-t-xl mb-4 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5]" />
                <h3 className="text-2xl font-semibold mb-4 font-montserrat" style={{ color: '#234C8C' }}>
                  Acompañamiento Personalizado
                </h3>
                <p className="text-[#373436] leading-relaxed font-montserrat">
                  Te acompaño de forma individual y adapto el proceso a tus necesidades y objetivos.
                  Recibís feedback y ajustes constantes para avanzar de verdad.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-[#687CA8]/20 font-montserrat">
                <div className="h-1 w-full rounded-t-xl mb-4 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5]" />
                <h3 className="text-2xl font-semibold mb-4 font-montserrat" style={{ color: '#234C8C' }}>
                  Pedagogía de la práctica
                </h3>
                <p className="text-[#373436] leading-relaxed font-montserrat">
                  No solo te enseño ejercicios, te acompaño a entender tu cuerpo y su funcionamiento. 
                  Entendés el "por qué" detrás de cada práctica y cómo aplicarlo a tu vida diaria.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-[#687CA8]/20 font-montserrat">
                <div className="h-1 w-full rounded-t-xl mb-4 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5]" />
                <h3 className="text-2xl font-semibold mb-4 font-montserrat" style={{ color: '#234C8C' }}>
                  Progreso Sostenido
                </h3>
                <p className="text-[#373436] leading-relaxed font-montserrat">
                  El proceso está pensado para que avances paso a paso, con objetivos claros y revisiones periódicas que aseguran tu evolución real.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Values */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-8 font-montserrat" style={{ color: 'black' }}>
                Nuestros Valores
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 bg-white/80 rounded-lg p-4 border border-[#687CA8]/10 font-montserrat">
                <CheckCircleIcon className="h-8 w-8" style={{ color: '#234C8C' }} />
                <div>
                  <h4 className="text-lg font-semibold text-[#373436] font-montserrat">Intencionalidad</h4>
                  <p className="text-[#687CA8] text-sm font-montserrat">Cada accionar tiene un propósito</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/80 rounded-lg p-4 border border-[#687CA8]/10 font-montserrat">
                <ArrowTrendingUpIcon className="h-8 w-8" style={{ color: '#234C8C' }} />
                <div>
                  <h4 className="text-lg font-semibold text-[#373436] font-montserrat">Crecimiento Continuo</h4>
                  <p className="text-[#687CA8] text-sm font-montserrat">La transformación es un camino, no un destino</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/80 rounded-lg p-4 border border-[#687CA8]/10 font-montserrat">
                <UserGroupIcon className="h-8 w-8" style={{ color: '#234C8C' }} />
                <div>
                  <h4 className="text-lg font-semibold text-[#373436] font-montserrat">Acompañamiento</h4>
                  <p className="text-[#687CA8] text-sm font-montserrat">No estás solo en este viaje</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/80 rounded-lg p-4 border border-[#687CA8]/10 font-montserrat">
                <ShieldCheckIcon className="h-8 w-8" style={{ color: '#234C8C' }} />
                <div>
                  <h4 className="text-lg font-semibold text-[#373436] font-montserrat">Compromiso</h4>
                  <p className="text-[#687CA8] text-sm font-montserrat">La constancia es la clave del cambio real</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/80 rounded-lg p-4 border border-[#687CA8]/10 font-montserrat">
                <EyeIcon className="h-8 w-8" style={{ color: '#234C8C' }} />
                <div>
                  <h4 className="text-lg font-semibold text-[#373436] font-montserrat">Conciencia</h4>
                  <p className="text-[#687CA8] text-sm font-montserrat">Movimiento con presencia y atención</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-[#F2F3F6] rounded-2xl p-8 border border-[#687CA8]/20">
            <p className="text-xl md:text-2xl text-[#373436] italic mb-4 font-montserrat">
              "La mentoría es el camino hacia 
              <b className="font-semibold"> conocer y crear tu propio movimiento</b> 
              , el que tu cuerpo necesita."
            </p>
            <p className="text-[#234C8C] font-montserrat">— Mateo Molfino</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MentorshipPhilosophy; 