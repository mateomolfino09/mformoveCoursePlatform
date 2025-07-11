'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { UserIcon, ClipboardDocumentListIcon, VideoCameraIcon, ChatBubbleLeftRightIcon, ChartBarIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { CldImage } from 'next-cloudinary';

const MentorshipProcess = () => {
  const steps = [
    {
      icon: UserIcon,
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
      icon: ClipboardDocumentListIcon,
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
      icon: VideoCameraIcon,
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
      icon: ChatBubbleLeftRightIcon,
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
      icon: ChartBarIcon,
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
      icon: AcademicCapIcon,
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
    <section className="py-20 bg-black font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#fff' }}>
            El Proceso de Mentoría
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'white' }}>
            Un camino estructurado hacia la transformación personal a través del movimiento consciente
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border hover:bg-white/10 transition-all duration-300"
              style={{ borderColor: '#B0B8C1' }}
            >
              {/* Step Number */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#23272F] border-2 border-[#B0B8C1] rounded-full flex items-center justify-center text-[#B0B8C1] font-bold text-lg">
                  {index + 1}
                </div>
                <step.icon className="w-8 h-8" style={{ color: '#B0B8C1' }} />
              </div>

              {/* Step Content */}
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#5fa8e9' }}>
                {step.title}
              </h3>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: '#fff' }}>
                {step.description}
              </p>

              {/* Step Details */}
              <div className="space-y-2">
                {step.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: '#A6B1C2' }}></div>
                    <span className="text-xs leading-relaxed" style={{ color: '#A6B1C2' }}>
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="relative rounded-2xl p-12 md:p-16 overflow-hidden" style={{ minHeight: '340px' }}>
            {/* Imagen de fondo Cloudinary con overlay */}
            <CldImage
              src="my_uploads/plaza/DSC03350_vgjrrh"
              width={1200}
              height={600}
              alt="Mentoría fondo inspirador"
              className="absolute inset-0 w-full h-full object-cover object-center z-0"
              style={{ filter: 'brightness(0.45) blur(2px)' }}
            />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#fff' }}>
                ¿Listo para comenzar tu transformación?
              </h3>
              <p className="mb-6 max-w-2xl mx-auto" style={{ color: 'white' }}>
                Este proceso requiere compromiso, pero los resultados son transformadores. 
                No solo cambiarás tu cuerpo, cambiarás tu relación con el movimiento para siempre.
              </p>
              <button 
                onClick={() => {
                  const element = document.getElementById('mentorship-plans');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                style={{ background: 'linear-gradient(90deg, #234C8C, #5fa8e9)', color: 'white' }}
              >
                Ver Planes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MentorshipProcess; 