'use client'
import React from 'react';
import { motion } from 'framer-motion';

const MentorshipCTA = () => {
  return (
    <section className="pt-6 pb-20 bg-white font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          {/* Main CTA */}
          <div className="bg-gray-900/5 rounded-2xl p-8 md:p-12 border border-black/10">
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-black">
                En resumen
              </h2>
              <p className="text-base md:text-lg text-gray-700 font-light leading-relaxed mb-6">
                Esta mentoría no es para todos. Es para personas que entienden que la transformación real lleva tiempo, esfuerzo y constancia.
              </p>
              <p className="text-base md:text-lg text-gray-700 font-light leading-relaxed">
                Si buscás un acompañamiento serio, con feedback honesto y un plan adaptado a vos, revisá los planes disponibles.
              </p>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
              className="flex justify-center mb-8"
            >
              <button 
                onClick={() => {
                  const element = document.getElementById('mentorship-plans');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-black text-white font-medium py-3 px-8 rounded-xl text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 group"
              >
                Ver planes disponibles
                <svg 
                  className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </motion.div>

            {/* FOMO note - Dentro del bloque */}
            <div className="text-center pt-6 border-t border-black/10">
              <p className="text-sm text-gray-500 font-light max-w-2xl mx-auto">
                Los planes están sujetos a subir de precio. Estamos constantemente revisando y puliendo los procesos para elevar la calidad de la mentoría. En caso de unirte al plan, el precio se mantiene fijo.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MentorshipCTA; 