'use client';

import React, { useState, useEffect } from 'react';
import { ProductDB } from '../../../../typings';
import { GlobeAltIcon, MapPinIcon, UsersIcon, CurrencyDollarIcon, ClockIcon, SparklesIcon, CheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { formatearPrecioEvento, formatearPrecioConDescuento, PrecioFormateado } from '../../../utils/currencyHelpers';
import { getLocationCity } from '../../../utils/locationHelpers';

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
  // Estado para los precios formateados
  const [precioFormateado, setPrecioFormateado] = useState<PrecioFormateado | null>(null);
  const [precioOriginalFormateado, setPrecioOriginalFormateado] = useState<PrecioFormateado | null>(null);
  const [ahorroFormateado, setAhorroFormateado] = useState<PrecioFormateado | null>(null);
  const [cargandoPrecios, setCargandoPrecios] = useState(true);

  // Cargar precios desde Stripe
  useEffect(() => {
    const cargarPrecios = async () => {
      if (!precioActual) {
        setCargandoPrecios(false);
        return;
      }

      try {
        setCargandoPrecios(true);
        
        // Formatear precio actual
        const precioActualFormateado = await formatearPrecioEvento(precioActual.precio, evento);
        setPrecioFormateado(precioActualFormateado);

        // Si hay precio original, formatear también
        if (precioActual.original) {
          const precioOriginal = await formatearPrecioEvento(precioActual.original, evento);
          setPrecioOriginalFormateado(precioOriginal);

          // Calcular ahorro
          const ahorro = await formatearPrecioEvento(precioActual.original - precioActual.precio, evento);
          setAhorroFormateado(ahorro);
        }
      } catch (error) {
        console.error('Error cargando precios desde Stripe:', error);
      } finally {
        setCargandoPrecios(false);
      }
    };

    cargarPrecios();
  }, [precioActual, evento]);

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

  // Variantes para animación simplificadas
  const fadeIn = () => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  });

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de la sección */}
        <div className="text-center mb-16 relative">
          {/* Animal decorativo sutil */}
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 relative z-10">
            Detalles del Evento
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light relative z-10">
            Toda la información que necesitas para tomar la mejor decisión
          </p>
        </div>

        {/* Grid de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Modalidad */}
          <motion.div 
            variants={fadeIn()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-gray-900/5 rounded-2xl p-6 border border-black/10 hover:bg-gray-900/10 transition-colors duration-200"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center">
                {evento.online ? (
                  <GlobeAltIcon className="h-6 w-6 opacity-80 text-black" />
                ) : (
                  <MapPinIcon className="h-6 opacity-80 w-6 text-black" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-light text-gray-900">Modalidad</h3>
                <p className="text-sm text-gray-500">Cómo se realizará</p>
              </div>
            </div>
            <p className="text-gray-800 font-light">
              {evento.online ? 'Online' : 'Presencial'}
            </p>
            {!evento.online && (
              <p className="text-gray-500 text-sm mt-1">
                {getLocationCity(evento.ubicacion)}
              </p>
            )}
          </motion.div>

          {/* Cupo */}
          {evento.cupo && (
            <motion.div 
              variants={fadeIn()}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-gray-900/5 rounded-2xl p-6 border border-black/10 hover:bg-gray-900/10 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center  opacity-70 justify-center">
                <img
                  src="/images/svg/noun-gorilla-651014.svg"
                  alt=""
                  className="w-9 text-white h-9 object-contain"
                />   
                </div>
                <div>
                  <h3 className="text-lg font-light text-gray-900">Cupo</h3>
                  <p className="text-sm text-gray-500">Plazas disponibles</p>
                </div>
              </div>
              <p className="text-gray-800 font-light">
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
              variants={fadeIn()}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-gray-900/5 rounded-2xl p-6 border border-black/10 hover:bg-gray-900/10 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-light text-gray-900">Precio</h3>
                  <p className="text-sm text-gray-500">{precioActual.tipo}</p>
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                {cargandoPrecios ? (
                  <span className="text-2xl font-light text-gray-900">Cargando...</span>
                ) : (
                  <span className="text-2xl font-light text-gray-900">
                    {precioFormateado?.textoCompleto}
                  </span>
                )}
                {precioActual.original && precioOriginalFormateado && (
                  <span className="text-lg text-gray-400 line-through">
                    {precioOriginalFormateado.textoCompleto}
                  </span>
                )}
              </div>
              {precioActual.original && ahorroFormateado && (
                <p className="text-gray-700 font-light text-sm mt-1">
                  Ahorras {ahorroFormateado.textoCompleto}
                </p>
              )}
              {precioActual.urgencia && (
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-light bg-black/5 text-black">
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  {precioActual.urgencia}
                </div>
              )}
              
              {/* Botón CTA Discreto */}
              <button
                onClick={onBuyTicket}
                className="w-full mt-3 bg-black text-white py-2 px-4 rounded-lg font-light text-sm hover:bg-gray-800 transition-colors duration-200 group flex items-center justify-center space-x-1"
              >
                <span className="flex items-center justify-center space-x-1">
                  <span>Reservar lugar</span>
                  <svg className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </motion.div>
          )}

          {/* Duración estimada */}
          <motion.div 
            variants={fadeIn()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-gray-900/5 rounded-2xl p-6 border border-black/10 hover:bg-gray-900/10 transition-colors duration-200"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center">
              <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 100 100"
  className="w-6 h-6 text-black"
  fill="none"
  stroke="currentColor"
  strokeWidth="6"
>
  {/* Círculo incompleto — flujo y paso del tiempo */}
  <path
    d="M50 10
       a40 40 0 1 1 -28.28 11.72"
    stroke="black"
    strokeLinecap="round"
    strokeOpacity="1"
  />
  {/* Punto central — presencia, duración, continuidad */}
  <circle cx="50" cy="50" r="4" fill="black" />
</svg>
              </div>
              <div>
                <h3 className="text-lg font-light text-gray-900">Duración</h3>
                <p className="text-sm text-gray-500">Tiempo estimado</p>
              </div>
            </div>
            <p className="text-gray-800 font-light">
              2-3 horas
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Incluye práctica y Q&A
            </p>
          </motion.div>

          {/* Estado del evento */}
          <motion.div 
            variants={fadeIn()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`rounded-2xl p-6 border shadow-sm bg-gray-900/5 border-black/10 hover:bg-gray-900/10 transition-colors duration-200`}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-black/5 p-2`}>
              <div className="relative w-6 h-6 flex items-center justify-center">
      {/* Círculo exterior (contención) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="absolute w-full h-full text-black"
        fill="none"
        stroke="black"
        strokeWidth="4"
      >
        <circle cx="50" cy="50" r="30" />
      </svg>

      {/* Círculo interno (pulso del estado) */}
      <div className="w-2.5 h-2.5 bg-black rounded-full animate-pulse-smooth" />
    </div>
              </div>
              <div>
                <h3 className="text-lg font-light text-gray-900">Estado</h3>
                <p className="text-sm text-gray-500">Disponibilidad</p>
              </div>
            </div>
            <p className={`font-light text-gray-800`}>
              {eventoTerminado ? 'Evento finalizado' : 'Inscripciones abiertas'}
            </p>
            {!eventoTerminado && (
              <p className="text-gray-500 text-sm mt-1">
                ¡Asegura tu lugar!
              </p>
            )}
          </motion.div>

          {/* Transferencia Bancaria - Solo para eventos presenciales */}
          {!evento.online && (
            <motion.div 
              variants={fadeIn()}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-gray-900/5 rounded-2xl p-4 border border-black/10 hover:bg-gray-900/10 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-light text-gray-900">Transferencia Bancaria</h3>
                  <p className="text-xs text-gray-600">Pago directo sin comisiones</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Banco:</span>
                  <span className="text-sm font-light text-gray-900">Itaú Uruguay</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Cuenta Pesos:</span>
                  <span className="text-sm font-mono font-light text-gray-900">3228196</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Cuenta Dólares:</span>
                  <span className="text-sm font-mono font-light text-gray-900">3228188</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Titular:</span>
                  <span className="text-sm font-light text-gray-900">Mateo Molfino</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-black/10">
                <p className="text-xs text-gray-600">
                  <span className="font-light">Importante:</span> Envía el comprobante a info@mateomove.com
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EventOverview; 