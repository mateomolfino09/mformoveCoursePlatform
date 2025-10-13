'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';

const MentorshipProcess = () => {
  const steps = [
    {
      title: "Evaluación Inicial",
      description: "Comenzamos con una evaluación completa de tu estado actual, objetivos y limitaciones. Esta es la base de todo el proceso.",
      details: [
        "Análisis de movilidad y fuerza",
        "Identificación de objetivos personales",
        "Evaluación de estilo de vida y disponibilidad",
        "Historial de lesiones y limitaciones"
      ]
    },
    {
      title: "Diseño Personalizado",
      description: "Creamos un plan único adaptado específicamente a tu cuerpo, objetivos y circunstancias de vida.",
      details: [
        "Programa de entrenamiento individualizado",
        "Secuencia de progresión personalizada",
        "Adaptaciones para tu estilo de vida",
        "Objetivos específicos y medibles"
      ]
    },
    {
      title: "Seguimiento Continuo",
      description: "Acompañamiento regular con feedback personalizado y ajustes según tu progreso y necesidades.",
      details: [
        "Revisión de videos de práctica",
        "Feedback detallado y constructivo",
        "Ajustes del programa según progreso",
        "Soporte para dudas y consultas"
      ]
    },
    {
      title: "Llamadas 1:1",
      description: "Sesiones de mentoría directa con Mateo para profundizar en conceptos y resolver dudas específicas.",
      details: [
        "Llamadas programadas según tu plan",
        "Análisis profundo de tu progreso",
        "Ajustes estratégicos del programa",
        "Mentoría en conceptos avanzados"
      ]
    },
    {
      title: "Evaluación de Progreso",
      description: "Revisión periódica de tus avances, ajustes del programa y establecimiento de nuevos objetivos.",
      details: [
        "Medición de progreso en objetivos",
        "Identificación de áreas de mejora",
        "Ajustes del programa según resultados",
        "Establecimiento de nuevos desafíos"
      ]
    },
    {
      title: "Formación Continua",
      description: "Educación constante sobre anatomía funcional, biomecánica y principios del movimiento consciente.",
      details: [
        "Material educativo personalizado",
        "Conceptos de anatomía funcional",
        "Principios de biomecánica aplicada",
        "Preparación para enseñanza (nivel avanzado)"
      ]
    }
  ];

  return (
    <section className="py-10 bg-black font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="mb-16 relative"
        >
          {/* DNA Helix en absolute - grande y sutil */}
          <div className="absolute -top-10 -right-4 w-40 h-40 md:w-96 md:h-96 opacity-50 pointer-events-none">
            <img 
              src="/images/svg/dnahelix.svg" 
              alt="DNA Helix"
              className="w-full h-full object-contain filter invert"
            />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white relative z-10">
            Hablemos de estructura...
          </h2>
          <p className="text-lg md:text-xl text-white/70 font-light max-w-3xl leading-relaxed relative z-10">
            Todo camino empieza en un punto. Tenemos que trazar estas lineas entre nodos para que el camino sea coherente. <br/> <br/>
            Te presento el mapa que va a acompañarte en este proceso.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              {/* Step Number and Icosahedron */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-white/10 border-2 border-white/30 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {index + 1}
                </div>
                <div className="w-16 h-16 relative opacity-60 group-hover:opacity-80 transition-opacity duration-300">
                  <img 
                    src="/images/svg/icosahedron2.svg" 
                    alt={step.title}
                    className="w-full h-full object-contain filter invert"
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
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
                Si lo que leíste hasta acá resuena con vos, revisá los planes disponibles.
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