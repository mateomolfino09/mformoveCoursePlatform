'use client';

import React from 'react';
import { ProductDB } from '../../../../typings';
import { CldImage } from 'next-cloudinary';
import { CheckCircleIcon, StarIcon, UserGroupIcon, AcademicCapIcon, SparklesIcon, UserIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface Props {
  evento: ProductDB;
}

const EventDescription: React.FC<Props> = ({ evento }) => {
  // Variante fade in para animaciones on scroll
  const fadeIn = (delay = 0) => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.7, delay } }
  });

  return (
    <section className="md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Columna principal - Descripción */}
          <div className="lg:col-span-2">
            <motion.div 
              className="md:bg-white bg-gray-50 rounded-3xl p-8 shadow-sm"
              variants={fadeIn(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Sobre este evento
              </h2>
              
              {/* Descripción principal */}
              <motion.div 
                className="prose prose-lg max-w-none mb-8"
                variants={fadeIn(0.2)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <p className="text-gray-700 leading-relaxed text-lg">
                  {evento.descripcion}
                </p>
              </motion.div>

              {/* Imagen destacada */}
              {(evento.imagenes && evento.imagenes.length > 0 ? evento.imagenes[0] : evento.portada) && (
                <motion.div 
                  className="mb-8"
                  variants={fadeIn(0.3)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <div className="relative rounded-2xl overflow-hidden">
                    <CldImage
                      src={(evento.imagenes && evento.imagenes.length > 0 ? evento.imagenes[0] : evento.portada) || ''}
                      alt={evento.nombre || 'Evento'}
                      width={800}
                      height={400}
                      className="w-full h-64 md:h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </motion.div>
              )}

              {/* Contenido detallado */}
              <div className="space-y-8">
                {/* Qué aprenderás */}
                <motion.div 
                  variants={fadeIn(0.4)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 flex items-center">
                    ¿Qué vas a aprender?
                  </h3>
                  <div className="max-w-4xl">
                    {evento.aprendizajes && evento.aprendizajes.length > 0 ? (
                      <div className="space-y-4">
                        {evento.aprendizajes.map((apr, idx) => (
                          <motion.div 
                            key={idx} 
                            className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-white to-gray-50/50 border border-gray-100 rounded-2xl hover:border-[#234C8C]/20 hover:shadow-lg hover:shadow-[#234C8C]/5 transition-all duration-300 transform hover:-translate-y-1"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.7, delay: idx * 0.1 }}
                            viewport={{ once: true, amount: 0.2 }}
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-[#234C8C] to-[black] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                              <span className="text-white font-bold text-sm">{idx + 1}</span>
                            </div>
                            <div className="flex-1">
                              <span className="text-gray-800 font-medium text-lg leading-relaxed group-hover:text-[#234C8C] transition-colors duration-300">
                                {apr}
                              </span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <CheckCircleIcon className="h-5 w-5 text-[#234C8C]" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-white to-gray-50/50 border border-gray-100 rounded-2xl hover:border-[#234C8C]/20 hover:shadow-lg hover:shadow-[#234C8C]/5 transition-all duration-300"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true, amount: 0.2 }}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-[#234C8C] to-[#5FA8E9] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white font-bold text-sm">1</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-gray-700 font-medium text-lg">Próximamente...</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Para quién es este evento */}
                <motion.div 
                  variants={fadeIn(0.5)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 flex items-center">
                    ¿Para quién es este evento?
                  </h3>
                  <div className="max-w-4xl">
                    {evento.paraQuien && evento.paraQuien.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {evento.paraQuien.map((pq, idx) => (
                          <motion.div 
                            key={idx} 
                            className="group relative overflow-hidden bg-gradient-to-br from-white via-gray-50/30 to-white border border-gray-200 rounded-2xl p-6 hover:border-[#234C8C]/30 hover:shadow-xl hover:shadow-[#234C8C]/10 transition-all duration-500 transform hover:-translate-y-2"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.7, delay: idx * 0.1 }}
                            viewport={{ once: true, amount: 0.2 }}
                          >
                            {/* Fondo decorativo */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#234C8C]/5 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                            
                            <div className="relative z-10">
                              <div className="flex items-start space-x-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#234C8C] to-[black] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                                  <UserIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <span className="text-gray-800 font-semibold text-lg leading-relaxed group-hover:text-[#234C8C] transition-colors duration-300">
                                    {pq}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Línea decorativa */}
                              <div className="w-full h-0.5 bg-gradient-to-r from-[#234C8C]/20 to-transparent group-hover:from-[#234C8C]/40 transition-all duration-300"></div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        className="group relative overflow-hidden bg-gradient-to-br from-white via-gray-50/30 to-white border border-gray-200 rounded-2xl p-6 hover:border-[#234C8C]/30 hover:shadow-xl hover:shadow-[#234C8C]/10 transition-all duration-500"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true, amount: 0.2 }}
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#234C8C]/5 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-start space-x-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#234C8C] to-[#5FA8E9] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                              <UserIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <span className="text-gray-700 font-semibold text-lg">Próximamente...</span>
                            </div>
                          </div>
                          
                          <div className="w-full h-0.5 bg-gradient-to-r from-[#234C8C]/20 to-transparent"></div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>


                {/* Lo que incluye */}
                <motion.div 
                  variants={fadeIn(0.6)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    ¿Qué incluye tu inscripción?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evento.beneficios && evento.beneficios.length > 0 ? (
                      evento.beneficios.map((beneficio, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-4 bg-white/80 border border-gray-200 rounded-xl">
                          <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700 font-medium">{beneficio}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center space-x-3 p-4 bg-white/80 border border-gray-200 rounded-xl">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">Acceso completo al evento</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Información adicional */}
                <motion.div 
                  variants={fadeIn(0.7)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Información adicional
                  </h3>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      Este evento está diseñado para proporcionarte una experiencia completa de aprendizaje. 
                      Combinamos teoría y práctica para que puedas aplicar inmediatamente lo que aprendas 
                      en tu vida diaria. No necesitas experiencia previa, solo ganas de aprender y mejorar.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Barra lateral */}
          <div className="space-y-6 pb-10 px-4 md:px-0 md:py-0 ">
            {/* Card de instructor */}
            <motion.div 
              className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center"
              variants={fadeIn(0.2)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Instructor</h3>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-[#234C8C]/30 shadow-lg">
                  <img
                    src="https://res.cloudinary.com/dbeem2avp/image/upload/v1751917144/my_uploads/plaza/IMG_0333_mheawa.jpg"
                    alt="Mateo Molfino"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center 10%' }}
                  />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Mateo Molfino</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Especialista en movimiento consciente, biomecánica y entrenamiento funcional
                </p>
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-500 text-xs mt-1">+500 estudiantes</p>
              </div>
            </motion.div>

            {/* Card premium personalizada */}
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 flex flex-col items-center"
              variants={fadeIn(0.3)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex justify-center items-center text-center">
                Material de estudio
              </h3>
              <p className="text-gray-700 text-sm text-center">
                Recibirás material de estudio para que puedas profundizar en los temas tratados en el evento.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDescription; 