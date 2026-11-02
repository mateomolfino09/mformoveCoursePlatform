'use client';

import React from 'react';
import { ProductDB } from '../../../../typings';
import { CldImage } from 'next-cloudinary';
import { CheckCircleIcon, UserIcon } from '@heroicons/react/24/solid';
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
              animate="visible"
              viewport={{ once: true }}
            >
              <p className="font-montserrat text-[11px] font-semibold uppercase tracking-[0.26em] text-palette-ink">El encuentro</p>
              <h2 className="mt-3 mb-6 font-montserrat text-[clamp(2.15rem,4vw,3.1rem)] font-extrabold leading-[1.08] tracking-tight text-palette-ink">
                Sobre este evento
              </h2>
              
              <motion.div 
                className="mb-8 max-w-none"
                variants={fadeIn()}
                initial="hidden"
                animate="visible"
                viewport={{ once: true }}
              >
                <p className="whitespace-pre-line font-montserrat text-[16px] font-normal leading-[1.72] text-palette-ink md:text-[18px]">
                  {evento.descripcion}
                </p>
              </motion.div>

              {/* Imagen destacada */}
              {(evento.imagenes && evento.imagenes.length > 0 ? evento.imagenes[0] : evento.portada) && (
                <motion.div 
                  className="mb-8"
                  variants={fadeIn()}
                  initial="hidden"
                  animate="visible"
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
                  animate="visible"
                  viewport={{ once: true }}
                >
                  <h3 className="mb-6 font-montserrat text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-tight text-palette-ink">
                    ¿Qué vas a aprender?
                  </h3>
                  <div className="max-w-4xl">
                    {evento.aprendizajes && evento.aprendizajes.length > 0 ? (
                      <div className="space-y-3">
                        {evento.aprendizajes.map((apr, idx) => (
                          <motion.div 
                            key={idx} 
                            className="flex items-start gap-4 rounded-2xl border border-palette-stone/20 bg-white/80 p-4"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            viewport={{ once: true }}
                          >
                            <span className="mt-0.5 font-montserrat text-[11px] font-semibold tracking-[0.16em] text-palette-ink/50">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="font-montserrat text-[16px] leading-[1.6] text-palette-ink md:text-[17px]">
                              {apr}
                            </span>
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
                  animate="visible"
                  viewport={{ once: true }}
                  className="relative"
                >

                  <h3 className="relative z-10 mb-6 font-montserrat text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-tight text-palette-ink">
                    ¿Para quién es?
                  </h3>
                  <div className="max-w-4xl">
                    {evento.paraQuien && evento.paraQuien.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {evento.paraQuien.map((pq, idx) => (
                          <motion.div 
                            key={idx} 
                            className="rounded-2xl border border-palette-stone/20 bg-white/80 p-5"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            viewport={{ once: true }}
                          >
                            <span className="font-montserrat text-[16px] leading-[1.6] text-palette-ink">
                              {pq}
                            </span>
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
                  animate="visible"
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

                {/* PDF de la jornada */}
                {evento.pdfPresentacionUrl ? (
                  <motion.div
                    variants={fadeIn()}
                    initial="hidden"
                    animate="visible"
                    viewport={{ once: true }}
                  >
                    <a
                      href={evento.pdfPresentacionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full border-2 border-palette-ink bg-palette-ink px-6 py-3 font-montserrat text-sm font-semibold uppercase tracking-[0.14em] text-palette-cream transition-colors hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink"
                    >
                      Descargar la info del trekking
                    </a>
                  </motion.div>
                ) : null}
              </div>
            </motion.div>
          </div>

          {/* Barra lateral */}
          <div className="space-y-6 pb-10 px-4 md:px-0 md:py-0 ">
            {/* Card de instructor */}
            <motion.div 
              className="flex flex-col items-center rounded-3xl border border-palette-stone/20 bg-white/80 p-6 shadow-[0_16px_48px_-28px_rgba(20,20,17,0.35)]"
              variants={fadeIn()}
              initial="hidden"
              animate="visible"
              viewport={{ once: true }}
            >
              <p className="mb-4 font-montserrat text-[11px] font-semibold uppercase tracking-[0.26em] text-palette-ink">Quién guía</p>
              <div className="text-center">
                <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border border-palette-stone/30">
                  <img
                    src="https://res.cloudinary.com/dbeem2avp/image/upload/v1751917144/my_uploads/plaza/IMG_0333_mheawa.jpg"
                    alt="Mateo Molfino"
                    className="h-full w-full object-cover"
                    style={{ objectPosition: 'center 10%' }}
                  />
                </div>
                <h4 className="mb-2 font-montserrat text-lg font-extrabold tracking-tight text-palette-ink">Mateo Molfino</h4>
                <p className="font-montserrat text-[15px] leading-[1.65] text-palette-ink/80">
                  Hola, soy profesor de movimiento, Instructor de yoga y calistenia. Me encanta entrenar, buscar nuevas formas de movimiento y ayudar a construir cuerpos fuertes, móviles y sanos.
                </p>
              </div>
            </motion.div>

            {evento.pdfPresentacionUrl ? (
              <motion.div
                className="flex flex-col items-center rounded-lg border border-palette-stone/20 bg-white/70 p-5"
                variants={fadeIn()}
                initial="hidden"
                animate="visible"
                viewport={{ once: true }}
              >
                <h3 className="mb-3 text-center font-montserrat text-xl font-medium text-palette-ink">
                  Info para el día
                </h3>
                <p className="mb-4 text-center text-sm text-palette-ink/70">
                  Horarios, punto de encuentro, qué llevar y cómo llegar.
                </p>
                <a
                  href={evento.pdfPresentacionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border-2 border-palette-ink px-5 py-2.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-palette-ink transition-colors hover:bg-palette-ink hover:text-palette-cream"
                >
                  Ver PDF
                </a>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDescription; 