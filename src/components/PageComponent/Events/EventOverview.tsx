'use client';

import React from 'react';
import { ProductDB } from '../../../../typings';
import { GlobeAltIcon, MapPinIcon, UsersIcon, CurrencyDollarIcon, ClockIcon, SparklesIcon, CheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Props {
  evento: ProductDB;
  precioActual: any;
  eventoTerminado: boolean;
  diasRestantes: number | null;
  onBuyTicket?: () => void;
  esProgramaTransformacional?: boolean;
}

const EventOverview: React.FC<Props> = ({ 
  evento, 
  precioActual, 
  eventoTerminado, 
  diasRestantes,
  onBuyTicket,
  esProgramaTransformacional = false
}) => {
  // Formatear fecha completa
  const formatearFechaCompleta = (fecha: string | Date | undefined) => {
    if (!fecha) return 'Fecha por confirmar';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Variantes para animación
  const fadeIn = (delay = 0) => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, delay } }
  });

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de la sección */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Detalles del Evento
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Toda la información que necesitas para tomar la mejor decisión
          </p>
        </div>

        {/* Grid de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Modalidad */}
          <motion.div 
            variants={fadeIn(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ scale: 1.03 }} 
            className="bg-white/80 rounded-2xl p-6 border border-gray-200 shadow-sm transition-transform duration-300"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-[#234C8C]/10 rounded-xl flex items-center justify-center">
                {evento.online ? (
                  <GlobeAltIcon className="h-6 w-6" style={{ color: '#234C8C' }} />
                ) : (
                  <MapPinIcon className="h-6 w-6" style={{ color: '#234C8C' }} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Modalidad</h3>
                <p className="text-sm text-gray-500">Cómo se realizará</p>
              </div>
            </div>
            <p className="text-gray-800 font-medium">
              {evento.online ? 'Online' : 'Presencial'}
            </p>
            {!evento.online && evento.ubicacion?.ciudad && (
              <p className="text-gray-500 text-sm mt-1">
                {evento.ubicacion.ciudad}
              </p>
            )}
          </motion.div>

          {/* Cupo */}
          {evento.cupo && (
            <motion.div 
              variants={fadeIn(0.2)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ scale: 1.03 }} 
              className="bg-white/80 rounded-2xl p-6 border border-gray-200 shadow-sm transition-transform duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-[#234C8C]/10 rounded-xl flex items-center justify-center">
                  <UsersIcon className="h-6 w-6" style={{ color: '#234C8C' }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Cupo</h3>
                  <p className="text-sm text-gray-500">Plazas disponibles</p>
                </div>
              </div>
              <p className="text-gray-800 font-medium">
                {evento.cupo} personas
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Cupo limitado
              </p>
            </motion.div>
          )}

          {/* Precio */}
          {precioActual && (
            <motion.div 
              variants={fadeIn(0.3)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ scale: 1.03 }} 
              className="bg-white/80 rounded-2xl p-6 border border-gray-200 shadow-sm transition-transform duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-[#234C8C]/10 rounded-xl flex items-center justify-center">
                  <CurrencyDollarIcon className="h-6 w-6" style={{ color: '#234C8C' }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Precio</h3>
                  <p className="text-sm text-gray-500">{precioActual.tipo}</p>
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  ${precioActual.precio}
                </span>
                {precioActual.original && (
                  <span className="text-lg text-gray-400 line-through">
                    ${precioActual.original}
                  </span>
                )}
              </div>
              {precioActual.original && (
                <p className="text-[#234C8C] font-medium text-sm mt-1">
                  Ahorras ${precioActual.original - precioActual.precio}
                </p>
              )}
              {precioActual.urgencia && (
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#234C8C]/10 text-[#234C8C]">
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  {precioActual.urgencia}
                </div>
              )}
              
              {/* Botón CTA Discreto */}
              <motion.button
                onClick={onBuyTicket}
                className="w-full mt-3 bg-white/80 text-[#234C8C] py-2 px-4 rounded-lg font-medium text-sm border border-[#234C8C]/20 hover:bg-[#234C8C]/5 hover:border-[#234C8C]/40 transition-all duration-300 group"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="flex items-center justify-center space-x-1">
                  <span>Reservar lugar</span>
                  <svg className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </motion.button>
            </motion.div>
          )}

          {/* Duración estimada */}
          <motion.div 
            variants={fadeIn(0.4)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ scale: 1.03 }} 
            className="bg-white/80 rounded-2xl p-6 border border-gray-200 shadow-sm transition-transform duration-300"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-[#234C8C]/10 rounded-xl flex items-center justify-center">
                <ClockIcon className="h-6 w-6" style={{ color: '#234C8C' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Duración</h3>
                <p className="text-sm text-gray-500">Tiempo estimado</p>
              </div>
            </div>
            <p className="text-gray-800 font-medium">
              2-3 horas
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Incluye práctica y Q&A
            </p>
          </motion.div>

          {/* Estado del evento */}
          <motion.div 
            variants={fadeIn(0.5)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ scale: 1.03 }} 
            className={`rounded-2xl p-6 border shadow-sm bg-white/80 border-gray-200 transition-transform duration-300`}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-[#234C8C]/10`}>
                <SparklesIcon className="h-6 w-6" style={{ color: '#234C8C' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Estado</h3>
                <p className="text-sm text-gray-500">Disponibilidad</p>
              </div>
            </div>
            <p className={`font-medium text-gray-800`}>
              {eventoTerminado ? 'Evento finalizado' : 'Inscripciones abiertas'}
            </p>
            {!eventoTerminado && (
              <p className="text-gray-500 text-sm mt-1">
                ¡Asegura tu lugar!
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EventOverview; 