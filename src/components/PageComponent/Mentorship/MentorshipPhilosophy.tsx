'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ArrowTrendingUpIcon, UserGroupIcon, ShieldCheckIcon, EyeIcon } from '@heroicons/react/24/outline';

const MentorshipPhilosophy = () => {
  return (
    <section className="pt-20 pb-6 bg-palette-cream font-montserrat">
      <div className="w-[85%] max-w-6xl mx-auto px-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-stone/80 mb-3">
            Metodología
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold mb-6 font-montserrat text-palette-ink tracking-tight">
            Metodología de trabajo
          </h2>
          <p className="text-xl text-palette-stone max-w-3xl mx-auto font-montserrat font-light leading-relaxed">
            No es solo entrenamiento: es una <b className="font-semibold text-palette-ink">transformación completa</b> de tu relación con el movimiento.
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
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-palette-stone/20 shadow-[0_10px_32px_rgba(20,20,17,0.06)] font-montserrat">
                <div className="h-1 w-full rounded-t-xl mb-4 bg-gradient-to-r from-transparent via-palette-sage/45 to-transparent" />
                <h3 className="text-2xl font-semibold mb-4 font-montserrat text-palette-ink tracking-tight">
                  Acompañamiento Personalizado
                </h3>
                <p className="text-palette-stone leading-relaxed font-montserrat font-light">
                  Te acompaño de forma individual y adapto el proceso a tus necesidades y objetivos.
                  Recibís feedback y ajustes constantes para avanzar de verdad.
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-palette-stone/20 shadow-[0_10px_32px_rgba(20,20,17,0.06)] font-montserrat">
                <div className="h-1 w-full rounded-t-xl mb-4 bg-gradient-to-r from-transparent via-palette-sage/45 to-transparent" />
                <h3 className="text-2xl font-semibold mb-4 font-montserrat text-palette-ink tracking-tight">
                  Pedagogía de la práctica
                </h3>
                <p className="text-palette-stone leading-relaxed font-montserrat font-light">
                  No solo te enseño ejercicios, te acompaño a entender tu cuerpo y su funcionamiento. 
                  Entendés el "por qué" detrás de cada práctica y cómo aplicarlo a tu vida diaria.
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-palette-stone/20 shadow-[0_10px_32px_rgba(20,20,17,0.06)] font-montserrat">
                <div className="h-1 w-full rounded-t-xl mb-4 bg-gradient-to-r from-transparent via-palette-sage/45 to-transparent" />
                <h3 className="text-2xl font-semibold mb-4 font-montserrat text-palette-ink tracking-tight">
                  Progreso Sostenido
                </h3>
                <p className="text-palette-stone leading-relaxed font-montserrat font-light">
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
              <h3 className="text-3xl font-semibold mb-8 font-montserrat text-palette-ink tracking-tight">
                Nuestros Valores
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 bg-white/60 rounded-xl p-4 border border-palette-stone/15 font-montserrat shadow-[0_10px_32px_rgba(20,20,17,0.05)]">
                <CheckCircleIcon className="h-8 w-8 text-palette-sage" />
                <div>
                  <h4 className="text-lg font-semibold text-palette-ink font-montserrat">Intencionalidad</h4>
                  <p className="text-palette-stone text-sm font-montserrat font-light">Cada accionar tiene un propósito</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/60 rounded-xl p-4 border border-palette-stone/15 font-montserrat shadow-[0_10px_32px_rgba(20,20,17,0.05)]">
                <ArrowTrendingUpIcon className="h-8 w-8 text-palette-sage" />
                <div>
                  <h4 className="text-lg font-semibold text-palette-ink font-montserrat">Crecimiento Continuo</h4>
                  <p className="text-palette-stone text-sm font-montserrat font-light">La transformación es un camino, no un destino</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/60 rounded-xl p-4 border border-palette-stone/15 font-montserrat shadow-[0_10px_32px_rgba(20,20,17,0.05)]">
                <UserGroupIcon className="h-8 w-8 text-palette-sage" />
                <div>
                  <h4 className="text-lg font-semibold text-palette-ink font-montserrat">Acompañamiento</h4>
                  <p className="text-palette-stone text-sm font-montserrat font-light">No estás solo en este viaje</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/60 rounded-xl p-4 border border-palette-stone/15 font-montserrat shadow-[0_10px_32px_rgba(20,20,17,0.05)]">
                <ShieldCheckIcon className="h-8 w-8 text-palette-sage" />
                <div>
                  <h4 className="text-lg font-semibold text-palette-ink font-montserrat">Compromiso</h4>
                  <p className="text-palette-stone text-sm font-montserrat font-light">La constancia es la clave del cambio real</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/60 rounded-xl p-4 border border-palette-stone/15 font-montserrat shadow-[0_10px_32px_rgba(20,20,17,0.05)]">
                <EyeIcon className="h-8 w-8 text-palette-sage" />
                <div>
                  <h4 className="text-lg font-semibold text-palette-ink font-montserrat">Conciencia</h4>
                  <p className="text-palette-stone text-sm font-montserrat font-light">Movimiento con presencia y atención</p>
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
          <div className="bg-white/55 rounded-2xl p-8 border border-palette-stone/20 shadow-[0_10px_32px_rgba(20,20,17,0.06)]">
            <p className="text-xl md:text-2xl text-palette-stone italic mb-4 font-montserrat font-light">
              "La mentoría es el camino hacia 
              <b className="font-semibold text-palette-ink"> conocer y crear tu propio movimiento</b> 
              , el que tu cuerpo necesita."
            </p>
            <p className="text-palette-ink font-montserrat">— Mateo Molfino</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MentorshipPhilosophy; 