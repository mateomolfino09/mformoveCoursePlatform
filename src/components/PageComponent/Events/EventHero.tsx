'use client';

import React from 'react';
import { ProductDB } from '../../../../typings';
import { CldImage } from 'next-cloudinary';
import { CalendarDaysIcon, MapPinIcon, UsersIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { GlobeAltIcon, SparklesIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { formatearPrecioEventoSync } from '../../../utils/currencyHelpers';

interface Props {
  evento: ProductDB;
  precioActual: any;
  eventoTerminado: boolean;
  diasRestantes: number | null;
  onBuyTicket: () => void;
  loading: boolean;
  esProgramaTransformacional?: boolean;
}

const EventHero: React.FC<Props> = ({ 
  evento, 
  precioActual, 
  eventoTerminado, 
  diasRestantes, 
  onBuyTicket, 
  loading,
  esProgramaTransformacional = false
}) => {
  
  
  // Variantes para animación simplificadas
  const fadeIn = (delay = 0) => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, delay } }
  });

  // Countdown para cambio de precio
  const [countdown, setCountdown] = React.useState<string | null>(null);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    const getNextChangeDate = () => {
      if (precioActual?.tipo === 'Early Bird' && evento.precios?.earlyBird?.end) {
        return new Date(evento.precios.earlyBird.end);
      }
      if (precioActual?.tipo === 'Precio General' && evento.precios?.general?.end) {
        return new Date(evento.precios.general.end);
      }
      return null;
    };
    const updateCountdown = () => {
      const nextChange = getNextChangeDate();
      if (!nextChange) {
        setCountdown(null);
        return;
      }
      const now = new Date();
      const diff = nextChange.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown(null);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      let str = '';
      if (days > 0) str += `${days}d `;
      if (hours > 0 || days > 0) str += `${hours}h `;
      str += `${minutes}m`;
      setCountdown(str);
    };
    updateCountdown();
    timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [precioActual, evento]);

  // Componente solo para mobile: info clave vertical
  const EventHeroInfoMobile = ({ evento, precioActual }: { evento: ProductDB, precioActual: any }) => (
    <div className="grid grid-cols-2 gap-4 w-full md:hidden mt-8 pt-16 md:pt-0">
      <motion.div
        className="flex items-center bg-white/10 rounded-2xl p-4 gap-3"
        variants={fadeIn(0.05)}
        initial="hidden"
        animate="visible"
        viewport={{ once: true }}
      >
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
          <CalendarDaysIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="text-white font-light text-base">
            {evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : 'Por confirmar'}
          </div>
          <div className="text-xs text-gray-300">Fecha</div>
        </div>
      </motion.div>
      <motion.div
        className="flex items-center bg-white/10 rounded-2xl p-4 gap-3"
        variants={fadeIn()}
        initial="hidden"
        animate="visible"
        viewport={{ once: true }}
      >
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
          {evento.online ? (
            <GlobeAltIcon className="h-6 w-6 text-white" />
          ) : (
            <MapPinIcon className="h-6 w-6 text-white" />
          )}
        </div>
        <div>
          <div className="text-white font-light text-base">
            {evento.online ? 'Online' : 'Presencial'}
          </div>
          <div className="text-xs text-gray-300">Modalidad</div>
        </div>
      </motion.div>
      {evento.cupo && (
        <motion.div
          className="flex items-center bg-white/10 rounded-2xl p-4 gap-3"
          variants={fadeIn()}
          initial="hidden"
          animate="visible"
          viewport={{ once: true }}
        >
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
          <img
                  src="/images/svg/whiteGorilla2.svg"
                  alt=""
                  className="w-full text-white h-full object-contain"
                />          </div>
          <div>
            <div className="text-white font-light text-base">{evento.cupo} personas</div>
            <div className="text-xs text-gray-300">Cupo</div>
          </div>
        </motion.div>
      )}
      {precioActual && (
        <motion.div
          className="flex items-center bg-white/10 rounded-2xl p-4 gap-3"
          variants={fadeIn()}
          initial="hidden"
          animate="visible"
          viewport={{ once: true }}
        >
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <CurrencyDollarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-white font-light text-base">
              {formatearPrecioEventoSync(precioActual.precio, evento).textoCompleto}
            </div>
            <div className="text-xs text-gray-300">Precio</div>
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Imagen de fondo con overlay */}
      <div className="absolute inset-0">
        {evento.portada ? (
          <>
            {/* Imagen para desktop */}
            <CldImage
              src={evento.portada}
              alt={evento.nombre || 'Evento'}
              fill
              className="object-cover hidden md:block"
              priority
            />
            {/* Imagen para móvil */}
            {evento.portadaMobile ? (
              <CldImage
                src={evento.portadaMobile}
                alt={evento.nombre || 'Evento'}
                fill
                className="object-cover md:hidden"
                priority
              />
            ) : (
              <CldImage
                src={evento.portada}
                alt={evento.nombre || 'Evento'}
                fill
                className="object-cover md:hidden"
                priority
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-black" />
        )}
        
        {/* Overlay simple */}
        <div className="absolute inset-0 bg-gradient-to-r from-palette-ink/80 via-palette-ink/55 to-palette-ink/35" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-0 mt-8 md:mt-16 pt-8 md:pt-0 pb-16 md:pb-0 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Columna izquierda - Información */}
          <div className="space-y-6 md:space-y-8">
            {/* Badges superiores */}
            <motion.div 
              className="flex flex-wrap gap-2 md:gap-3"
              variants={fadeIn()}
              initial="hidden"
              animate="visible"
              viewport={{ once: true }}
            >
              {/* Badge de modalidad */}
              <div className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-light bg-white/10 backdrop-blur-sm text-white border border-white/20">
                {evento.online ? (
                  <>
                    <GlobeAltIcon className="h-4 w-4 mr-2" />
                    Online
                  </>
                ) : (
                  <>
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    Presencial
                  </>
                )}
              </div>
              
              {/* Badge de urgencia */}
              {precioActual?.urgencia === 'Precio aumentará pronto' && countdown && (
                <div className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-light bg-white/10 backdrop-blur-sm text-white border border-white/20">
                    <p>Precio sube en <span className="font-light"> {` ${countdown}`}</span></p>    
                </div>
                  )}
              
              {/* Badge de estado */}
              {eventoTerminado ? (
                <div className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-light bg-white/10 backdrop-blur-sm text-white border border-white/20">
                  Finalizado
                </div>
              ) : diasRestantes && diasRestantes <= 7 && diasRestantes > 0 && (
                <div className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-light bg-white/10 backdrop-blur-sm text-white border border-white/20">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  {diasRestantes === 1 ? 'Mañana' : `${diasRestantes} días`}
                </div>
              )}
            </motion.div>

            {/* Título principal */}
            <motion.div 
              className="space-y-3 md:space-y-4 relative"
              variants={fadeIn()}
              initial="hidden"
              animate="visible"
              viewport={{ once: true }}
            >
              <p className="font-montserrat text-[11px] font-semibold uppercase tracking-[0.26em] text-palette-cream/80">
                {evento.online ? 'Encuentro online' : 'Encuentro presencial'}
              </p>
              <h1 className="relative z-10 font-montserrat text-[clamp(2.8rem,6.5vw,5rem)] font-extrabold leading-[0.96] tracking-tight text-palette-cream">
                {evento.nombre}
              </h1>
              <p className="relative z-10 max-w-xl whitespace-pre-line font-montserrat text-lg font-normal leading-relaxed text-palette-cream/85 md:text-xl">
                {(evento.descripcion || '').split(/\n\n/)[0]}
              </p>
            </motion.div>

            {/* Información clave */}
            {/* Mobile: info clave vertical */}
            <div className="md:hidden">
              <EventHeroInfoMobile evento={evento} precioActual={precioActual} />
              
              {/* Botón de reserva para mobile */}
              {precioActual && !eventoTerminado && (
                <motion.div
                  variants={fadeIn()}
                  initial="hidden"
                  animate="visible"
                  viewport={{ once: true }}
                  className="mt-8"
                >
                  <button
                    onClick={onBuyTicket}
                    disabled={loading}
                    className="flex w-full items-center justify-center space-x-2 rounded-full border-2 border-palette-cream bg-palette-cream px-6 py-3 font-montserrat text-sm font-semibold uppercase tracking-[0.14em] text-palette-ink transition-colors hover:border-palette-sage hover:bg-palette-sage disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <span>Reservar mi lugar</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </div>
            {/* Desktop: grid info clave */}
            <motion.div 
              className="hidden md:grid grid-cols-4 gap-6 mt-8"
              variants={fadeIn()}
              initial="hidden"
              animate="visible"
              viewport={{ once: true }}
            >
              <div className="text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CalendarDaysIcon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-gray-300 mb-1">Fecha</p>
                <p className="text-white font-light text-sm">
                  {evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric'
                  }) : 'Por confirmar'}
                </p>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  {evento.online ? (
                    <GlobeAltIcon className="h-6 w-6 text-white" />
                  ) : (
                    <MapPinIcon className="h-6 w-6 text-white" />
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-1">Modalidad</p>
                <p className="text-white font-light text-sm">
                  {evento.online ? 'Online' : 'Presencial'}
                </p>
              </div>
              {evento.cupo && (
                <div className="text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <UsersIcon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-300 mb-1">Cupo</p>
                  <p className="text-white font-light text-sm">{evento.cupo} personas</p>
                </div>
              )}
              {precioActual && (
                <div className="text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-300 mb-1">Precio</p>
                  <p className="text-white font-light text-sm">{formatearPrecioEventoSync(precioActual.precio, evento).textoCompleto}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Columna derecha - CTA */}
          <motion.div 
            className="flex justify-center lg:justify-end"
            variants={fadeIn()}
            initial="hidden"
            animate="visible"
            viewport={{ once: true }}
          >
            <div className="hidden w-full max-w-md rounded-2xl border border-palette-stone/20 bg-palette-cream p-6 text-palette-ink shadow-[0_20px_50px_-24px_rgba(20,20,17,0.45)] md:block md:p-8">
              {precioActual && !eventoTerminado ? (
                <div className="text-center space-y-6">
                  <div>
                    <p className="mb-2 font-montserrat text-[11px] font-semibold uppercase tracking-[0.22em] text-palette-ink/70">{precioActual.tipo}</p>
                    <div className="flex items-center justify-center space-x-3">
                      <span className="font-montserrat text-4xl font-extrabold tracking-tight text-palette-ink md:text-5xl">
                        {formatearPrecioEventoSync(precioActual.precio, evento).textoCompleto}
                      </span>
                      {precioActual.original && (
                        <span className="font-montserrat text-lg text-palette-ink/40 line-through md:text-2xl">
                          {formatearPrecioEventoSync(precioActual.original, evento).textoCompleto}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={onBuyTicket}
                    disabled={loading}
                    className="flex w-full items-center justify-center space-x-2 rounded-full border-2 border-palette-ink bg-palette-ink px-6 py-3 font-montserrat text-sm font-semibold uppercase tracking-[0.14em] text-palette-cream transition-colors hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Procesando...</span>
                    ) : (
                      <>
                        <span>Reservar mi lugar</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                  
                  {precioActual.urgencia === 'Precio aumentará pronto' && countdown && (
                    <p className="text-center font-montserrat text-sm text-palette-ink/70">
                      Precio sube en <span className="font-semibold">{countdown}</span>
                    </p>
                  )}
                  {precioActual.urgencia && precioActual.urgencia !== 'Precio aumentará pronto' && (
                    <p className="text-center font-montserrat text-sm text-palette-ink/70">
                        {precioActual.urgencia}
                    </p>
                  )}

                  <div className="border-t border-palette-stone/20 pt-6">
                    <h3 className="mb-4 font-montserrat text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-ink/60">Incluye</h3>
                    <ul className="space-y-3 text-left text-sm text-palette-ink/80">
                      {evento.beneficios && evento.beneficios.length > 0 ? (
                        evento.beneficios.map((beneficio, index) => (
                          <li key={index} className='flex items-start gap-3 text-sm'>
                            <div className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-palette-ink'/>
                            <span>{beneficio}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start gap-3 text-sm">
                            <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-palette-ink"/>
                            <span>Acceso completo al evento</span>
                          </li>
                          {evento.online && (
                            <li className="flex items-start gap-3 text-sm">
                              <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-palette-ink"/>
                              <span>Grabación del evento</span>
                            </li>
                          )}
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              ) : eventoTerminado ? (
                <div className="text-center">
                  <p className="mb-4 font-montserrat text-2xl font-medium text-palette-ink">Evento finalizado</p>
                  <p className="text-palette-ink/70">Este evento ya ha terminado</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-4 font-montserrat text-2xl font-medium text-palette-ink">Próximamente</p>
                  <p className="text-palette-ink/70">Los tickets estarán disponibles pronto</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <div className="w-4 h-7 md:w-6 md:h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-2 md:w-1 md:h-3 bg-white/60 rounded-full mt-1 md:mt-2 animate-pulse"/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHero; 