'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';

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
    <section className="py-10 bg-black font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
          className="mb-0 relative"
        >
          {/* DNA Helix en absolute - grande y sutil */}
          <div className="absolute -top-10 -right-4 w-40 h-40 md:w-96 md:h-96 opacity-50 pointer-events-none">
            <img 
              src="/images/svg/dnahelix3.svg" 
              alt="DNA Helix"
              className="w-full h-full object-contain filter invert"
            />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white relative z-10">
            Hablemos de estructura...
          </h2>
          <p className="text-lg md:text-xl text-white/70 font-light max-w-3xl leading-relaxed relative z-10">
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
              className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              {/* Icosahedron with Number */}
              <div className="mb-6">
                <div className="w-16 h-16 relative flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img 
                    src={`/images/svg/icosahedro${index + 1}.svg`}
                    alt=""
                    className="w-full h-full object-contain filter invert transform scale-150"
                  />
                </div>
              </div>

              {/* Step Content */}
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-white">
                {step.title}
              </h3>
              <p className="text-sm md:text-base mb-4 leading-relaxed text-white/70 font-light">
                {step.description}
              </p>

              {/* Step Details */}
              <div className="space-y-2">
                {step.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-white/40"></div>
                    <span className="text-xs md:text-sm leading-relaxed text-white/50 font-light">
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
          <div className="relative rounded-2xl p-12 md:p-16 overflow-hidden border border-white/10" style={{ minHeight: '300px' }}>
            {/* Imagen de fondo con overlay oscuro */}
            <CldImage
              src="my_uploads/plaza/DSC03350_vgjrrh"
              width={1200}
              height={600}
              alt="Mentoría fondo"
              className="absolute inset-0 w-full h-full object-cover object-center z-0"
              style={{ filter: 'brightness(0.3) grayscale(100%)' }}
            />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-white">
                ¿Te interesa este proceso?
              </h3>
              <p className="mb-8 max-w-2xl mx-auto text-white/80 font-light leading-relaxed text-sm md:text-base">
                Si esto que te conté te hace sentido, dale una mirada a los planes que tengo disponibles y hablamos.
              </p>
              <button 
                onClick={() => {
                  const element = document.getElementById('mentorship-plans');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white text-black px-8 py-3 font-medium text-sm md:text-base hover:bg-black hover:text-white transition-all duration-300 font-montserrat rounded-xl border border-white"
              >
                Ver planes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MentorshipProcess; 