'use client';

import React, { useState, useEffect } from 'react';
import { ProductDB } from '../../../../typings';
import { CheckCircleIcon, FireIcon, ArrowRightIcon, SparklesIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { formatearPrecioEvento, formatearPrecioConDescuento, PrecioFormateado } from '../../../utils/currencyHelpers';

interface Props {
  evento: ProductDB;
  precioActual: any;
  eventoTerminado: boolean;
  onBuyTicket: () => void;
  loading: boolean;
  esProgramaTransformacional?: boolean;
}

const EventCTA: React.FC<Props> = ({ 
  evento, 
  precioActual, 
  eventoTerminado, 
  onBuyTicket, 
  loading,
  esProgramaTransformacional = false
}) => {
  // Estado para el countdown
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

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

  // Función para calcular el tiempo restante hasta que vence el precio actual
  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!evento.precios || !precioActual) return;
      
      // Obtener la fecha actual
      const now = new Date();
      
      // Determinar la fecha de vencimiento del precio actual
      let priceEndDate: Date | null = null;
      
      if (precioActual.tipo === 'Early Bird' && evento.precios.earlyBird?.end) {
        priceEndDate = new Date(evento.precios.earlyBird.end);
      } else if (precioActual.tipo === 'Precio General' && evento.precios.general?.end) {
        priceEndDate = new Date(evento.precios.general.end);
      } else if (precioActual.tipo === 'Last Tickets' && evento.fecha) {
        // Para Last Tickets, usar la fecha del evento como fecha de vencimiento
        priceEndDate = new Date(evento.fecha);
      }
      
      if (!priceEndDate) return;
      
      // Función helper para calcular la diferencia de tiempo de manera más precisa
      const calculateTimeDifference = (targetDate: Date, currentDate: Date) => {
        const diffMs = targetDate.getTime() - currentDate.getTime();
        
        if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        return { days, hours, minutes, seconds };
      };
      

      // Calcular el tiempo restante usando la función helper
      const timeLeft = calculateTimeDifference(priceEndDate, now);
            
      setTimeLeft(timeLeft);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [evento.fecha, evento.precios, precioActual]);

  // Variantes para animaciones simplificadas
  const fadeIn = () => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  });

  return (
    <section className="py-16 md:py-24 bg-gray-50 relative overflow-hidden">
      {/* Fondo con patrón sutil basado en ciencia */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-100"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Principal */}
        <motion.div 
          className="mb-16 md:mb-20 relative"
          variants={fadeIn()}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 md:mb-8 font-montserrat leading-tight">
            El movimiento como
            <span className="text-gray-700"> herramienta de transformación</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl leading-relaxed font-montserrat font-light">
            Explorar los límites del cuerpo no es solo ejercicio físico.
            <br />
            Es un proceso de <span className="text-gray-800 font-light">descubrimiento personal</span> y conexión con tu potencial.
            <br />
            <span className="text-gray-800 font-light">{evento.nombre}</span> te invita a experimentar esto de manera consciente y científica.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">
          
          {/* Columna izquierda - Beneficios (7 columnas) */}
          <div className="lg:col-span-7 space-y-8 md:space-y-12">
            
          {/* Beneficios principales */}
          <motion.div 
            className="space-y-6 md:space-y-8"
            variants={fadeIn()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              <div className="group text-center sm:text-left">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-200/60 rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto sm:mx-0">
                  <img 
                    src="/images/svg/tensegrity-structure.svg" 
                    alt=""
                    className="h-6 w-6 md:h-8 md:w-8"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-light text-gray-900 mb-2 md:mb-3 font-montserrat">
                  Principios de Biotensegridad
                </h3>
                <p className="text-sm md:text-base text-gray-600 font-montserrat leading-relaxed">
                  Comprende cómo funciona la estructura de tu cuerpo desde una perspectiva científica
                </p>
              </div>

              <div className="group text-center sm:text-left">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-200/60 rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto sm:mx-0">
                  <img 
                    src="/images/svg/muscle-fiber.svg" 
                    alt=""
                    className="h-6 w-6 md:h-8 md:w-8"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-light text-gray-900 mb-2 md:mb-3 font-montserrat">
                  Conciencia Corporal
                </h3>
                <p className="text-sm md:text-base text-gray-600 font-montserrat leading-relaxed">
                  Desarrolla una conexión más profunda con tu anatomía y patrones de movimiento
                </p>
              </div>

              <div className="group text-center sm:text-left">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-200/60 rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto sm:mx-0">
                  <img 
                    src="/images/svg/movement-flow.svg" 
                    alt=""
                    className="h-6 w-6 md:h-8 md:w-8"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-light text-gray-900 mb-2 md:mb-3 font-montserrat">
                  Movimiento Inteligente
                </h3>
                <p className="text-sm md:text-base text-gray-600 font-montserrat leading-relaxed">
                  Aprende a moverte de manera eficiente y consciente, respetando tu biomecánica
                </p>
              </div>
            </div>
          </motion.div>

          {/* Testimonios */}
          <motion.div 
            className="space-y-6"
            variants={fadeIn()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 font-montserrat text-center md:text-left">
              Experiencias de transformación
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-stretch">
              <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl md:rounded-3xl lg:rounded-3xl p-6 md:p-8 lg:p-10 border border-gray-200/60 hover:bg-gray-100 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center space-x-1 mb-3 md:mb-4 lg:mb-5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    ))}
                  </div>
                  <p className="text-gray-700 italic font-montserrat leading-relaxed text-sm md:text-base lg:text-lg">
                    "Los espacios liderados por Mateo son un lugar perfecto para encontrarse a uno mismo a través del movimiento, el esfuerzo y el juego. Con equilibrio entre exigencia y paciencia, te da la confianza y herramientas para conectar con tu cuerpo"
                  </p>
                </div>
                <div className="flex items-center space-x-3 md:space-x-4 lg:space-x-5 mt-6 md:mt-8 lg:mt-10 relative z-10">
                  <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gray-200/80 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-800 font-light text-xs md:text-sm lg:text-base">MP</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-gray-900 font-light font-montserrat text-sm md:text-base lg:text-lg">Determinación</p>
                    <p className="text-gray-600 text-xs md:text-sm lg:text-base font-montserrat">Participante</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl md:rounded-3xl lg:rounded-3xl p-6 md:p-8 lg:p-10 border border-gray-200/60 hover:bg-gray-100 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center space-x-1 mb-3 md:mb-4 lg:mb-5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    ))}
                  </div>
                  <p className="text-gray-700 italic font-montserrat leading-relaxed text-sm md:text-base lg:text-lg">
                    "Mateo es un maestro que te guía a través de un proceso de descubrimiento y transformación. Su enfoque es claro, directo y siempre enriquecedor."
                  </p>
                </div>
                <div className="flex items-center space-x-3 md:space-x-4 lg:space-x-5 mt-6 md:mt-8 lg:mt-10">
                  <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gray-200/80 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-800 font-light text-xs md:text-sm lg:text-base">CA</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-gray-900 font-light font-montserrat text-sm md:text-base lg:text-lg">Profesional</p>
                    <p className="text-gray-600 text-xs md:text-sm lg:text-base font-montserrat">Entrenador personal</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </div>

        {/* Columna derecha - CTA (5 columnas) */}
        <div className="lg:col-span-5 order-first lg:order-last">
          <motion.div 
            className="lg:sticky lg:top-8"
            variants={fadeIn()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 border border-gray-800/40 relative overflow-hidden">
                {precioActual && !eventoTerminado ? (
                                     <div className="text-center space-y-6 md:space-y-8 lg:space-y-10 relative z-10">
                     {/* Header del CTA */}
                     <div>
                       <h3 className="text-xl md:text-2xl lg:text-3xl font-light text-white mb-2 md:mb-3 font-montserrat">
                         {evento.nombre}
                       </h3>
                       <p className="text-sm md:text-base lg:text-lg text-gray-300 font-montserrat">
                         Un enfoque científico del movimiento
                       </p>
                     </div>
                     
                     <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                       Descubre cómo el movimiento consciente puede transformar tu relación con el cuerpo y la mente.
                     </p>



                     <div className="bg-gray-800/60 rounded-2xl p-4 md:p-6 lg:p-8 border border-gray-700/40">
                       <p className="text-gray-300 text-xs md:text-sm lg:text-base mb-2 font-montserrat">{precioActual.tipo}</p>
                       <div className="flex items-center justify-center space-x-2 md:space-x-3 lg:space-x-4 mb-2">
                         {cargandoPrecios ? (
                           <span className="text-3xl md:text-4xl lg:text-5xl font-light text-white">
                             Cargando...
                           </span>
                         ) : (
                           <span className="text-3xl md:text-4xl lg:text-5xl font-light text-white">
                             {precioFormateado?.textoCompleto}
                           </span>
                         )}
                         {precioActual.original && precioOriginalFormateado && (
                           <span className="text-xl md:text-2xl lg:text-3xl text-gray-400 line-through">
                             {precioOriginalFormateado.textoCompleto}
                           </span>
                         )}
                       </div>
                       {precioActual.original && ahorroFormateado && (
                         <p className="text-white/80 font-light font-montserrat text-sm md:text-base lg:text-lg">
                           Ahorras {ahorroFormateado.textoCompleto}
                         </p>
                       )}
                       
                                               {/* Countdown */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-gray-300 text-xs md:text-sm lg:text-base mb-3 font-montserrat text-center">
                            {precioActual.tipo === 'Last Tickets' ? 'El evento comienza en:' : 'El precio aumenta en:'}
                          </p>
                         <div className="grid grid-cols-4 gap-2 lg:gap-3">
                                                        <div className="text-center">
                               <div className="bg-white/10 rounded-lg p-2 lg:p-3">
                                 <div className="text-lg md:text-xl lg:text-2xl font-light text-white">
                                   {timeLeft.days}
                                 </div>
                                 <div className="text-xs lg:text-sm text-gray-300 font-montserrat">
                                   Días
                                 </div>
                               </div>
                             </div>
                             <div className="text-center">
                               <div className="bg-white/10 rounded-lg p-2 lg:p-3">
                                 <div className="text-lg md:text-xl lg:text-2xl font-light text-white">
                                   {timeLeft.hours.toString().padStart(2, '0')}
                                 </div>
                                 <div className="text-xs lg:text-sm text-gray-300 font-montserrat">
                                   Horas
                                 </div>
                               </div>
                             </div>
                             <div className="text-center">
                               <div className="bg-white/10 rounded-lg p-2 lg:p-3">
                                 <div className="text-lg md:text-xl lg:text-2xl font-light text-white">
                                   {timeLeft.minutes.toString().padStart(2, '0')}
                                 </div>
                                 <div className="text-xs lg:text-sm text-gray-300 font-montserrat">
                                   Min
                                 </div>
                               </div>
                             </div>
                             <div className="text-center">
                               <div className="bg-white/10 rounded-lg p-2 lg:p-3">
                                 <div className="text-lg md:text-xl lg:text-2xl font-light text-white">
                                   {timeLeft.seconds.toString().padStart(2, '0')}
                                 </div>
                                 <div className="text-xs lg:text-sm text-gray-300 font-montserrat">
                                   Seg
                                 </div>
                               </div>
                             </div>
                         </div>
                       </div>
                     </div>

                  {/* Botón principal */}
                  <button
                    onClick={onBuyTicket}
                    disabled={loading}
                    className="w-full bg-white text-gray-900 py-3 md:py-4 lg:py-5 px-6 md:px-8 lg:px-10 rounded-2xl font-light text-base md:text-lg lg:text-xl hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 md:space-x-3 group"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"/>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <span>Participar</span>
                        <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </button>

                  {/* Urgencia */}
                  {precioActual.urgencia && (
                    <div className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-3 md:p-4 lg:p-5">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <FireIcon className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-gray-400" />
                        <p className="text-gray-300 font-light font-montserrat text-xs md:text-sm lg:text-base">
                          {precioActual.urgencia}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Beneficios incluidos */}
                  <div className="pt-4 md:pt-6 lg:pt-8 border-t border-gray-700/40">
                    <h4 className="font-light text-white mb-3 md:mb-4 lg:mb-5 font-montserrat text-sm md:text-base lg:text-lg">Incluye:</h4>
                       <ul className="space-y-2 md:space-y-3 lg:space-y-4 text-xs md:text-sm lg:text-base text-gray-300">
                        {evento.beneficios && evento.beneficios.length > 0 ? (
                          evento.beneficios.map((beneficio, index) => (
                                                     <li key={index} className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
                           <CheckCircleIcon className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
                           <span className="font-montserrat text-left">{beneficio}</span>
                         </li>
                          ))
                        ) : (
                          <>
                                                       <li className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
                             <CheckCircleIcon className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
                             <span className="font-montserrat">Acceso completo al evento</span>
                           </li>
                           <li className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
                             <CheckCircleIcon className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
                             <span className="font-montserrat">Material de apoyo digital</span>
                           </li>
                           <li className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
                             <CheckCircleIcon className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
                             <span className="font-xl font-montserrat">Certificado de participación</span>
                           </li>
                                                         {evento.online && (
                               <li className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
                                 <CheckCircleIcon className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
                                 <span className="font-montserrat">Grabación del evento</span>
                               </li>
                             )}
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
              ) : eventoTerminado ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-700/60 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-light text-white mb-3 font-montserrat">
                    Evento finalizado
                  </h3>
                  <p className="text-gray-300 font-montserrat">
                    Este evento ya ha terminado. Mantente informado sobre nuestros próximos eventos.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-700/60 rounded-full flex items-center justify-center mx-auto mb-6">
                    <img 
                      src="/images/svg/emerging-growth.svg" 
                      alt=""
                      className="h-16 w-16 filter brightness-0 relative -top-2 invert opacity-90"
                    />
                  </div>
                  <h3 className="text-2xl font-light text-white mb-3 font-montserrat">
                    Próximamente
                  </h3>
                  <p className="text-gray-300 font-montserrat">
                    Los tickets estarán disponibles pronto. Mantente informado.
                  </p>
                </div>
              )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventCTA; 