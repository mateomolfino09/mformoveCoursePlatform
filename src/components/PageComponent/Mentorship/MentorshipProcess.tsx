'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import imageLoader from '../../../../imageLoader';

const MentorshipProcess = () => {
  const steps = [
    {
      title: "Evaluación Inicial",
      description: "Necesito entender tu estructura corporal actual. Analizo tus patrones de movimiento y limitaciones para diseñar un enfoque personalizado.",
      details: [
        "Análisis de tu estructura corporal",
        "Evaluación de patrones de movimiento",
        "Identificación de compensaciones corporales",
        "Historial de lesiones y limitaciones"
      ]
    },
    {
      title: "Diseño Personalizado",
      description: "Creo un programa único para vos.",
      details: [
        "Programa adaptado a vos",
        "Progresión del movimiento",
        "Objetivos medibles y específicos"
      ]
    },
    {
      title: "Seguimiento Técnico",
      description: "Reviso tu práctica. Analizo tu técnica, identifico compensaciones y te guío hacia movimientos más eficientes.",
      details: [
        "Análisis de tu práctica",
        "Corrección de compensaciones",
        "Optimización de patrones de movimiento",
        "Feedback sobre tu movimiento"
      ]
    },
    {
      title: "Mentoría 1:1",
      description: "En nuestras sesiones profundizamos.",
      details: [
        "Sesiones de mentoría programadas",
        "Educación y formación",
        "Principios de prácrica de movimiento"
      ]
    },
    {
      title: "Evaluación Continua",
      description: "Medimos tu progreso. Evaluamos mejoras en tu estructura, eficiencia de movimiento y capacidad de carga.",
      details: [
        "Medición de progreso estructural",
        "Evaluación de eficiencia de movimiento",
        "Análisis de capacidad de carga",
        "Ajustes según resultados"
      ]
    },
    {
      title: "Formación",
      description: "Te educo en los principios fundamentales del movimiento humano. Anatomía, fisiología, biotensegridad y cómo aplicarlos en tu práctica diaria.",
      details: [
        "Educación en anatomía funcional",
        "Principios de biotensegridad",
        "Fisiología del movimiento",
        "Preparación para enseñanza avanzada"
      ]
    }
  ];

  return (
    <section className="py-10 bg-[#FAF8F3] font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
          className="mb-0 relative"
        >
          <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-gray-500 mb-3">El proceso</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black relative z-10">
            Hablemos de estructura...
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-light max-w-3xl leading-relaxed relative z-10">
            Todo camino empieza en un punto. Tenemos que trazar estas lineas entre nodos para que el camino sea coherente. <br/> <br/>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
              className="group bg-gradient-to-br from-white via-[#FAF8F3]/50 to-[#F5F1E8]/30 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-[#AF50E5]/20 hover:bg-gradient-to-br hover:from-white hover:via-[#FAF8F3] hover:to-[#F5F1E8] transition-all duration-300 shadow-[0_4px_20px_rgba(175,80,229,0.08)] hover:shadow-[0_24px_48px_-12px_rgba(175,80,229,0.2)]"
            >
              {/* Icosahedron with Number */}
              <div className="mb-3">
                <div className="w-20 h-20 md:w-28 md:h-28 relative flex items-center justify-center flex-shrink-0 overflow-visible rounded-2xl bg-gradient-to-br from-[#AF50E5]/10 via-[#AF50E5]/5 to-[#F5F1E8]/40 border border-[#AF50E5]/20">
                  <Image
                    src={`/images/svg/icosahedro${index + 1}.svg`}
                    width={500}
                    height={500}
                    loader={imageLoader}
                    alt=""
                    className="w-32 h-32 md:w-24 md:h-24"
                    style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(1352%) hue-rotate(261deg) brightness(95%) contrast(90%)' }}
                  />
                </div>
              </div>

              {/* Step Content */}
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-black">
                {step.title}
              </h3>
              <p className="text-sm md:text-base mb-4 leading-relaxed text-gray-600 font-light">
                {step.description}
              </p>

              {/* Step Details */}
              <div className="space-y-2">
                {step.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-gradient-to-r from-[#AF50E5] to-[#AF50E5]/60" />
                    <span className="text-xs md:text-sm leading-relaxed text-gray-700 font-light">
                      {detail}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="relative rounded-3xl p-12 md:p-16 overflow-hidden border border-[#AF50E5]/20 bg-gradient-to-br from-[#F5F1E8] via-[#FAF8F3] to-white shadow-[0_25px_60px_0_rgba(175,80,229,0.15)]" style={{ minHeight: '300px' }}>
            {/* Imagen de fondo con overlay */}
            <CldImage
              src="my_uploads/plaza/DSC03350_vgjrrh"
              width={1200}
              height={600}
              alt="Mentoría fondo"
              className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-20"
              style={{ filter: 'brightness(0.8) grayscale(30%)' }}
            />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-black">
                ¿Te interesa este proceso?
              </h3>
              <p className="mb-8 max-w-2xl mx-auto text-gray-600 font-light leading-relaxed text-sm md:text-base">
                Si esto que te conté te hace sentido, dale una mirada a los planes que tengo disponibles y hablamos.
              </p>
              <button 
                onClick={() => {
                  const element = document.getElementById('mentorship-plans');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-black/80 text-white px-8 py-3 font-medium text-sm md:text-base hover:bg-[#9A3FD4] transition-all duration-300 font-montserrat rounded-xl border border-black shadow-lg hover:shadow-xl"
              >
                Entrenar conmigo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MentorshipProcess; 