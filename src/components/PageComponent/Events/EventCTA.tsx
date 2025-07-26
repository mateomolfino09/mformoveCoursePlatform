'use client';

import React, { useState, useEffect } from 'react';
import { ProductDB } from '../../../../typings';
import { CheckCircleIcon, StarIcon, FireIcon, ArrowRightIcon, SparklesIcon, AcademicCapIcon, UserIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface Props {
  evento: ProductDB;
  precioActual: any;
  eventoTerminado: boolean;
  onBuyTicket: () => void;
  loading: boolean;
}

const EventCTA: React.FC<Props> = ({ 
  evento, 
  precioActual, 
  eventoTerminado, 
  onBuyTicket, 
  loading 
}) => {
  // Estado para el countdown
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Función para calcular el tiempo restante
  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!evento.fecha) return;
      
      const now = new Date().getTime();
      const eventDate = new Date(evento.fecha).getTime();
      const difference = eventDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [evento.fecha]);

  // Variantes para animaciones
  const fadeInUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay } }
  });

  const scaleIn = (delay = 0) => ({
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, delay } }
  });

  return (
    <section className="py-12 md:py-24 bg-black relative overflow-hidden">
      {/* Fondo con patrón sutil */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '60px 60px'
          }}></div>
        </div>
      </div>

              <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Principal */}
          <motion.div 
            className="text-center mb-12 md:mb-20"
            variants={fadeInUp(0.2)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 md:mb-8 font-montserrat leading-tight">
              Tu cuerpo está
              <span className="bg-gradient-to-r from-[#234C8C] to-[#5FA8E9] bg-clip-text text-transparent"> esperando</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-montserrat font-light px-4">
              Rompé con lo convencional. Desafia las normas establecidas y 
              <span className="text-white font-medium"> redescubrí la libertad que existe en tu cuerpo.</span>
            </p>
          </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">
          
          {/* Columna izquierda - Beneficios (7 columnas) */}
          <div className="lg:col-span-7 space-y-8 md:space-y-12">
            
            {/* Beneficios principales */}
                         <motion.div 
               className="space-y-6 md:space-y-8"
               variants={fadeInUp(0.4)}
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, amount: 0.3 }}
             >
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                                 <div className="group text-center sm:text-left">
                   <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#234C8C] to-[#5FA8E9] rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto sm:mx-0">
                     <AcademicCapIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                   </div>
                   <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 font-montserrat">
                     Rompé Paradigmas
                   </h3>
                   <p className="text-sm md:text-base text-gray-400 font-montserrat leading-relaxed">
                     Desapegate de lo tipico y conoce tu verdadero potencial
                   </p>
                 </div>

                                 <div className="group text-center sm:text-left">
                   <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#234C8C] to-[#5FA8E9] rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto sm:mx-0">
                     <UserIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                   </div>
                   <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 font-montserrat">
                     Libertad Natural
                   </h3>
                   <p className="text-sm md:text-base text-gray-400 font-montserrat leading-relaxed">
                     Redescubrí la libertad que existe en tu cuerpo y tu movimiento
                   </p>
                 </div>

                                 <div className="group text-center sm:text-left">
                   <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#234C8C] to-[#5FA8E9] rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto sm:mx-0">
                     <TrophyIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                   </div>
                   <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 font-montserrat">
                     Transformación Personal
                   </h3>
                   <p className="text-sm md:text-base text-gray-400 font-montserrat leading-relaxed">
                     Lo que el cuerpo cura, el movimiento lo expresa.
                   </p>
                 </div>
              </div>
            </motion.div>

            {/* Testimonios */}
                         <motion.div 
               className="space-y-6"
               variants={fadeInUp(0.6)}
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, amount: 0.3 }}
             >
               <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 font-montserrat text-center md:text-left">
                 Quienes ya rompieron sus límites
               </h3>
               
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-stretch">
                 <div className="bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl lg:rounded-3xl p-6 md:p-8 lg:p-10 border border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between h-full">
                   <div>
                     <div className="flex items-center space-x-1 mb-3 md:mb-4 lg:mb-5">
                       {[...Array(5)].map((_, i) => (
                         <StarIcon key={i} className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-yellow-400" />
                       ))}
                     </div>
                     <p className="text-gray-200 italic font-montserrat leading-relaxed text-sm md:text-base lg:text-lg">
                       "Los espacios liderados por Mateo son un lugar perfecto para encontrarse a uno mismo a través del movimiento, el esfuerzo y el juego. Con equilibrio entre exigencia y paciencia, te da la confianza y herramientas para conectar con tu cuerpo"
                     </p>
                   </div>
                   <div className="flex items-center space-x-3 md:space-x-4 lg:space-x-5 mt-6 md:mt-8 lg:mt-10">
                     <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-[#234C8C] to-[#5FA8E9] rounded-full flex items-center justify-center flex-shrink-0">
                       <span className="text-white font-bold text-xs md:text-sm lg:text-base">MP</span>
                     </div>
                     <div className="flex flex-col justify-center">
                       <p className="text-white font-semibold font-montserrat text-sm md:text-base lg:text-lg">Matilde Penades</p>
                       <p className="text-gray-400 text-xs md:text-sm lg:text-base font-montserrat">Participante</p>
                     </div>
                   </div>
                 </div>

                 <div className="bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl lg:rounded-3xl p-6 md:p-8 lg:p-10 border border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between h-full">
                   <div>
                     <div className="flex items-center space-x-1 mb-3 md:mb-4 lg:mb-5">
                       {[...Array(5)].map((_, i) => (
                         <StarIcon key={i} className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-yellow-400" />
                       ))}
                     </div>
                     <p className="text-gray-200 italic font-montserrat leading-relaxed text-sm md:text-base lg:text-lg">
                       "Mateo es un maestro que te guía a través de un proceso de descubrimiento y transformación. Su enfoque es claro, directo y siempre enriquecedor."
                     </p>
                   </div>
                   <div className="flex items-center space-x-3 md:space-x-4 lg:space-x-5 mt-6 md:mt-8 lg:mt-10">
                     <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-[#234C8C] to-[#5FA8E9] rounded-full flex items-center justify-center flex-shrink-0">
                       <span className="text-white font-bold text-xs md:text-sm lg:text-base">CA</span>
                     </div>
                     <div className="flex flex-col justify-center">
                       <p className="text-white font-semibold font-montserrat text-sm md:text-base lg:text-lg">Carlos Acuña</p>
                       <p className="text-gray-400 text-xs md:text-sm lg:text-base font-montserrat">Entrenador personal</p>
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
               variants={scaleIn(0.8)}
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, amount: 0.3 }}
             >
               <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 border border-white/20 shadow-2xl">
                {precioActual && !eventoTerminado ? (
                                     <div className="text-center space-y-6 md:space-y-8 lg:space-y-10">
                     {/* Header del CTA */}
                     <div>
                       <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3 font-montserrat">
                         Tu transformación espera
                       </h3>
                       <p className="text-sm md:text-base lg:text-lg text-gray-300 font-montserrat">
                         Cupos limitados
                       </p>
                     </div>

                                         {/* Precio */}
                     <div className="bg-gradient-to-br from-[#234C8C]/20 to-[#5FA8E9]/20 rounded-2xl p-4 md:p-6 lg:p-8 border border-[#234C8C]/30">
                       <p className="text-gray-300 text-xs md:text-sm lg:text-base mb-2 font-montserrat">{precioActual.tipo}</p>
                       <div className="flex items-center justify-center space-x-2 md:space-x-3 lg:space-x-4 mb-2">
                         <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                           ${precioActual.precio}
                         </span>
                         {precioActual.original && (
                           <span className="text-xl md:text-2xl lg:text-3xl text-gray-400 line-through">
                             ${precioActual.original}
                           </span>
                         )}
                       </div>
                       {precioActual.original && (
                         <p className="text-[#5FA8E9] font-semibold font-montserrat text-sm md:text-base lg:text-lg">
                           Ahorras ${precioActual.original - precioActual.precio}
                         </p>
                       )}
                       
                       {/* Countdown */}
                       <div className="mt-4 pt-4 border-t border-[#234C8C]/20">
                         <p className="text-gray-300 text-xs md:text-sm lg:text-base mb-3 font-montserrat text-center">
                           El precio aumenta en:
                         </p>
                         <div className="grid grid-cols-4 gap-2 lg:gap-3">
                                                        <div className="text-center">
                               <div className="bg-white/10 rounded-lg p-2 lg:p-3">
                                 <div className="text-lg md:text-xl lg:text-2xl font-bold text-white">
                                   {timeLeft.days}
                                 </div>
                                 <div className="text-xs lg:text-sm text-gray-300 font-montserrat">
                                   Días
                                 </div>
                               </div>
                             </div>
                             <div className="text-center">
                               <div className="bg-white/10 rounded-lg p-2 lg:p-3">
                                 <div className="text-lg md:text-xl lg:text-2xl font-bold text-white">
                                   {timeLeft.hours.toString().padStart(2, '0')}
                                 </div>
                                 <div className="text-xs lg:text-sm text-gray-300 font-montserrat">
                                   Horas
                                 </div>
                               </div>
                             </div>
                             <div className="text-center">
                               <div className="bg-white/10 rounded-lg p-2 lg:p-3">
                                 <div className="text-lg md:text-xl lg:text-2xl font-bold text-white">
                                   {timeLeft.minutes.toString().padStart(2, '0')}
                                 </div>
                                 <div className="text-xs lg:text-sm text-gray-300 font-montserrat">
                                   Min
                                 </div>
                               </div>
                             </div>
                             <div className="text-center">
                               <div className="bg-white/10 rounded-lg p-2 lg:p-3">
                                 <div className="text-lg md:text-xl lg:text-2xl font-bold text-white">
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
                     <motion.button
                       onClick={onBuyTicket}
                       disabled={loading}
                       className="w-full bg-gradient-to-r from-[#234C8C] to-[#5FA8E9] text-white py-3 md:py-4 lg:py-5 px-6 md:px-8 lg:px-10 rounded-2xl font-bold text-base md:text-lg lg:text-xl hover:shadow-2xl hover:shadow-[#234C8C]/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 md:space-x-3 group"
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                     >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <>
                          <span>Liberar mi cuerpo</span>
                          <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </motion.button>

                                         {/* Urgencia */}
                     {precioActual.urgencia && (
                       <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 md:p-4 lg:p-5">
                         <div className="flex items-center space-x-2 lg:space-x-3">
                           <FireIcon className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-red-400" />
                           <p className="text-red-300 font-semibold font-montserrat text-xs md:text-sm lg:text-base">
                             {precioActual.urgencia}
                           </p>
                         </div>
                       </div>
                     )}

                                         {/* Beneficios incluidos */}
                     <div className="pt-4 md:pt-6 lg:pt-8 border-t border-white/10">
                       <h4 className="font-semibold text-white mb-3 md:mb-4 lg:mb-5 font-montserrat text-sm md:text-base lg:text-lg">Incluye:</h4>
                       <ul className="space-y-2 md:space-y-3 lg:space-y-4 text-xs md:text-sm lg:text-base text-gray-300">
                        {evento.beneficios && evento.beneficios.length > 0 ? (
                          evento.beneficios.map((beneficio, index) => (
                                                     <li key={index} className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
                           <CheckCircleIcon className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-[#5FA8E9] flex-shrink-0" />
                           <span className="font-montserrat">{beneficio}</span>
                         </li>
                          ))
                        ) : (
                          <>
                                                       <li className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
                             <CheckCircleIcon className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-[#5FA8E9] flex-shrink-0" />
                             <span className="font-montserrat">Acceso completo al evento</span>
                           </li>
                           <li className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
                             <CheckCircleIcon className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-[#5FA8E9] flex-shrink-0" />
                             <span className="font-montserrat">Material de apoyo digital</span>
                           </li>
                           <li className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
                             <CheckCircleIcon className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-[#5FA8E9] flex-shrink-0" />
                             <span className="font-xl font-montserrat">Certificado de participación</span>
                           </li>
                                                         {evento.online && (
                               <li className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
                                 <CheckCircleIcon className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-[#5FA8E9] flex-shrink-0" />
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
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircleIcon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 font-montserrat">
                      Evento finalizado
                    </h3>
                    <p className="text-gray-300 font-montserrat">
                      Este evento ya ha terminado. ¡Mantente atento a nuestros próximos eventos!
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#234C8C] to-[#5FA8E9] rounded-full flex items-center justify-center mx-auto mb-6">
                      <SparklesIcon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 font-montserrat">
                      Próximamente
                    </h3>
                    <p className="text-gray-300 font-montserrat">
                      Los tickets estarán disponibles pronto. ¡Suscríbete para ser notificado!
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