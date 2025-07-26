'use client';

import React from 'react';
import { ProductDB } from '../../../../typings';
import { CldImage } from 'next-cloudinary';
import { CalendarDaysIcon, MapPinIcon, UsersIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { GlobeAltIcon, SparklesIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface Props {
  evento: ProductDB;
  precioActual: any;
  eventoTerminado: boolean;
  diasRestantes: number | null;
  onBuyTicket: () => void;
  loading: boolean;
}

const EventHero: React.FC<Props> = ({ 
  evento, 
  precioActual, 
  eventoTerminado, 
  diasRestantes, 
  onBuyTicket, 
  loading 
}) => {
  
  
  // Variantes para animación scroll
  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay } }
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

  const fadeIn = (delay = 0) => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, delay } }
  });

  // Componente solo para mobile: info clave vertical
  const EventHeroInfoMobile = ({ evento, precioActual }: { evento: ProductDB, precioActual: any }) => (
    <div className="grid grid-cols-2 gap-4 w-full md:hidden mt-8">
      <motion.div
        className="flex items-center bg-white/10 rounded-2xl p-4 gap-3"
        variants={fadeIn(0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <CalendarDaysIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-base">
            {evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : 'Por confirmar'}
          </div>
          <div className="text-xs text-gray-300">Fecha</div>
        </div>
      </motion.div>
      <motion.div
        className="flex items-center bg-white/10 rounded-2xl p-4 gap-3"
        variants={fadeIn(0.2)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          {evento.online ? (
            <GlobeAltIcon className="h-6 w-6 text-white" />
          ) : (
            <MapPinIcon className="h-6 w-6 text-white" />
          )}
        </div>
        <div>
          <div className="text-white font-bold text-base">
            {evento.online ? 'Online' : 'Presencial'}
          </div>
          <div className="text-xs text-gray-300">Modalidad</div>
        </div>
      </motion.div>
      {evento.cupo && (
        <motion.div
          className="flex items-center bg-white/10 rounded-2xl p-4 gap-3"
          variants={fadeIn(0.3)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <UsersIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-base">{evento.cupo} personas</div>
            <div className="text-xs text-gray-300">Cupo</div>
          </div>
        </motion.div>
      )}
      {precioActual && (
        <motion.div
          className="flex items-center bg-white/10 rounded-2xl p-4 gap-3"
          variants={fadeIn(0.4)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <CurrencyDollarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-base">${precioActual.precio}</div>
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
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-0 mt-8 md:mt-16 pb-16 md:pb-0 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Columna izquierda - Información */}
          <div className="space-y-6 md:space-y-8">
            {/* Badges superiores */}
            <motion.div 
              className="flex flex-wrap gap-2 md:gap-3"
              variants={fadeUp(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {/* Badge de modalidad */}
              <div className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 transition-all duration-300">
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
                <div className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 transition-all duration-300">
                    <p>Precio sube en <span className="font-bold"> {` ${countdown}`}</span></p>    
                </div>
                  )}
              
              {/* Badge de estado */}
              {eventoTerminado ? (
                <div className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 transition-all duration-300">
                  Finalizado
                </div>
              ) : diasRestantes && diasRestantes <= 7 && diasRestantes > 0 && (
                <div className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 transition-all duration-300">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  {diasRestantes === 1 ? 'Mañana' : `${diasRestantes} días`}
                </div>
              )}
            </motion.div>

            {/* Título principal */}
            <motion.div 
              className="space-y-3 md:space-y-4"
              variants={fadeUp(0.3)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <h1 className="text-5xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                {evento.nombre}
              </h1>
              <p className="text-base sm:text-lg md:text-2xl text-gray-200 font-light max-w-2xl leading-relaxed">
                {evento.descripcion}
              </p>
            </motion.div>

            {/* Información clave */}
            {/* Mobile: info clave vertical */}
            <div className="md:hidden">
              <EventHeroInfoMobile evento={evento} precioActual={precioActual} />
              
              {/* Botón de reserva para mobile */}
              {precioActual && !eventoTerminado && (
                <motion.div
                  variants={fadeUp(0.6)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className="mt-8"
                >
                  <motion.button
                    onClick={onBuyTicket}
                    disabled={loading}
                    className="w-full bg-gradient-to-br from-[#234C8C] via-[#1a3d73] to-[#234C8C] text-white py-3 px-6 rounded-2xl font-bold text-base shadow-xl shadow-[#234C8C]/40 border border-white/20 backdrop-blur-sm hover:shadow-2xl hover:shadow-[#234C8C]/60 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Efecto de brillo premium */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {/* Efecto de borde brillante */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Contenido del botón */}
                    <span className="relative z-10 flex items-center justify-center space-x-3">
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <>
                          <span>Reservar mi lugar</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </span>
                  </motion.button>
                </motion.div>
              )}
            </div>
            {/* Desktop: grid info clave */}
            <motion.div 
              className="hidden md:grid grid-cols-4 gap-6 mt-8"
              variants={fadeUp(0.5)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="text-center flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3 hover:bg-white/30 transition-colors duration-300">
                  <CalendarDaysIcon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-gray-300 mb-1">Fecha</p>
                <p className="text-white font-semibold text-sm">
                  {evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric'
                  }) : 'Por confirmar'}
                </p>
              </div>
              <div className="text-center flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3 hover:bg-white/30 transition-colors duration-300">
                  {evento.online ? (
                    <GlobeAltIcon className="h-6 w-6 text-white" />
                  ) : (
                    <MapPinIcon className="h-6 w-6 text-white" />
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-1">Modalidad</p>
                <p className="text-white font-semibold text-sm">
                  {evento.online ? 'Online' : 'Presencial'}
                </p>
              </div>
              {evento.cupo && (
                <div className="text-center flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3 hover:bg-white/30 transition-colors duration-300">
                    <UsersIcon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-300 mb-1">Cupo</p>
                  <p className="text-white font-semibold text-sm">{evento.cupo} personas</p>
                </div>
              )}
              {precioActual && (
                <div className="text-center flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3 hover:bg-white/30 transition-colors duration-300">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-300 mb-1">Precio</p>
                  <p className="text-white font-semibold text-sm">${precioActual.precio}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Columna derecha - CTA */}
          <motion.div 
            className="flex justify-center lg:justify-end"
            variants={fadeUp(0.7)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 md:p-8 border hidden md:block border-white/20 w-full max-w-md hover:bg-white/15 transition-all duration-300 hover:scale-105">
              {precioActual && !eventoTerminado ? (
                <div className="text-center space-y-6">
                  <div>
                    <p className="text-white/80 text-sm mb-2">{precioActual.tipo}</p>
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-3xl md:text-5xl font-bold text-white">
                        ${precioActual.precio}
                      </span>
                      {precioActual.original && (
                        <span className="text-lg md:text-2xl text-white/60 line-through">
                          ${precioActual.original}
                        </span>
                      )}
                    </div>
                  </div>

                  <motion.button
                    onClick={onBuyTicket}
                    disabled={loading}
                    className="w-full bg-white text-black py-3 md:py-4 px-6 md:px-8 rounded-2xl font-bold text-base md:text-lg hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Procesando...' : 'Reservar mi lugar →'}
                  </motion.button>
                  
                  {precioActual.urgencia === 'Precio aumentará pronto' && countdown && (
                    <p className="text-center text-sm text-[white] font-semibold">
                      Precio sube en <span className="font-bold">{countdown}</span>
                    </p>
                  )}
                  {precioActual.urgencia && precioActual.urgencia !== 'Precio aumentará pronto' && (
                    <p className="text-center text-sm text-white font-semibold">
                        {precioActual.urgencia}
                    </p>
                  )}

                  <div className="pt-6 border-t border-white/20">
                    <h3 className="font-semibold text-white mb-4">Incluye:</h3>
                    <ul className="space-y-3 text-sm text-white/80">
                      {evento.beneficios && evento.beneficios.length > 0 ? (
                        evento.beneficios.map((beneficio, index) => (
                          <li key={index} className='flex items-center space-x-2 md:space-x-3 hover:text-white transition-colors duration-200 text-xs md:text-sm'>
                            <div className='w-2 h-2 bg-white rounded-full'></div>
                            <span>{beneficio}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-center space-x-2 md:space-x-3 hover:text-white transition-colors duration-200 text-xs md:text-sm">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span>Acceso completo al evento</span>
                          </li>
                          {evento.online && (
                            <li className="flex items-center space-x-2 md:space-x-3 hover:text-white transition-colors duration-200 text-xs md:text-sm">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
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
                  <p className="text-2xl font-bold text-white mb-4">Evento finalizado</p>
                  <p className="text-white/80">Este evento ya ha terminado</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-2xl font-bold text-white mb-4">Próximamente</p>
                  <p className="text-white/80">Los tickets estarán disponibles pronto</p>
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
            <div className="w-1 h-2 md:w-1 md:h-3 bg-white/60 rounded-full mt-1 md:mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHero; 