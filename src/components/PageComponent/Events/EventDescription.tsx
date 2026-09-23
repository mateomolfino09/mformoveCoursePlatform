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
  // Variante fade in simplificada
  const fadeIn = () => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  });

  return (
    <section className="bg-palette-cream py-14 md:py-16">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Columna principal - Descripción */}
          <div className="lg:col-span-2">
            <motion.div 
              className="rounded-lg border border-palette-stone/15 bg-white/70 p-6 md:p-8"
              variants={fadeIn()}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="mb-4 font-montserrat text-[clamp(1.9rem,4vw,2.6rem)] font-medium tracking-tight text-palette-ink">
                Sobre este evento
              </h2>
              
              {/* Descripción principal */}
              <motion.div 
                className="prose prose-lg max-w-none mb-8"
                variants={fadeIn()}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <p className="text-gray-700 leading-relaxed text-lg">
                  {evento.descripcion}
                </p>
              </motion.div>

              {/* Imagen destacada */}
              {(evento.imagenes && evento.imagenes.length > 0 ? evento.imagenes[0] : evento.portada) && (
                <motion.div 
                  className="mb-8"
                  variants={fadeIn()}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
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
                  variants={fadeIn()}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
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
                            className="group flex items-center space-x-4 p-4 rounded-lg border border-palette-stone/20 bg-white/70 transition-colors hover:bg-white"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            viewport={{ once: true }}
                          >
                            <div className="w-16 h-16 relative flex items-center justify-center flex-shrink-0 overflow-hidden">
                              <img 
                                src={`/images/svg/icosahedro${idx + 1}.svg`}
                                alt=""
                                className="w-24 h-24 object-contain scale-150"
                              />
                            </div>
                            <div className="flex-1">
                              <span className="text-gray-800 font-light text-lg leading-relaxed">
                                {apr}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        className="group flex items-center space-x-4 p-4 rounded-lg border border-palette-stone/20 bg-white/70"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        viewport={{ once: true }}
                      >
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-light text-sm">1</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-gray-700 font-light text-lg">Próximamente...</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Para quién es este evento */}
                <motion.div 
                  variants={fadeIn()}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="relative"
                >

                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 flex items-center relative z-10">
                    ¿Para quién es este evento?
                  </h3>
                  <div className="max-w-4xl">
                    {evento.paraQuien && evento.paraQuien.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {evento.paraQuien.map((pq, idx) => (
                          <motion.div 
                            key={idx} 
                            className="rounded-lg border border-palette-stone/20 bg-white/70 p-6 hover:bg-gray-900/10 transition-colors duration-200"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            viewport={{ once: true }}
                          >
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12  rounded-xl flex items-center justify-center flex-shrink-0">
                                <img 
                                  src="/images/svg/noun-gorilla-651014.svg"
                                  alt=""
                                  className="h-12 opacity-60 w-12 object-contain"
                                />
                              </div>
                              <div className="flex-1">
                                <span className="text-gray-800 font-light text-lg leading-relaxed">
                                  {pq}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        className="rounded-lg border border-palette-stone/20 bg-white/70 p-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        viewport={{ once: true }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                            <UserIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <span className="text-gray-700 font-light text-lg">Próximamente...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>


                {/* Lo que incluye */}
                <motion.div 
                  variants={fadeIn()}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    ¿Qué incluye tu inscripción?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evento.beneficios && evento.beneficios.length > 0 ? (
                      evento.beneficios.map((beneficio, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-4 rounded-lg border border-palette-stone/20 bg-white/70">
                          <CheckCircleIcon className="h-5 w-5 text-black/60 flex-shrink-0" />
                          <span className="text-gray-700 font-light">{beneficio}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-palette-stone/20 bg-white/70">
                        <CheckCircleIcon className="h-5 w-5 text-black/60 flex-shrink-0" />
                        <span className="text-gray-700 font-light">Acceso completo al evento</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Información adicional */}
                <motion.div 
                  variants={fadeIn()}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
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
              className="flex flex-col items-center rounded-lg border border-palette-stone/15 bg-white/70 p-6"
              variants={fadeIn()}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-light text-gray-900 mb-4">Instructor</h3>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 border-black/10">
                  <img
                    src="https://res.cloudinary.com/dbeem2avp/image/upload/v1751917144/my_uploads/plaza/IMG_0333_mheawa.jpg"
                    alt="Mateo Molfino"
                    className="w-full h-full object-cover grayscale-[30%]"
                    style={{ objectPosition: 'center 10%' }}
                  />
                </div>
                <h4 className="font-light text-gray-900 mb-2">Mateo Molfino</h4>
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
              className="flex flex-col items-center rounded-lg border border-palette-stone/20 bg-white/70 p-5"
              variants={fadeIn()}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-light text-gray-900 mb-4 flex justify-center items-center text-center">
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