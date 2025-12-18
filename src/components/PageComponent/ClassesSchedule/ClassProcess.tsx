'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';

interface ClassProcessProps {
  classType: 'comun' | 'personalizado';
}

const commonSteps = [
  {
    title: "Inscripción",
    description: "Te inscribís en la clase que mejor se adapte a tu horario y nivel.",
    details: [
      "Elegís tu modalidad (presencial o virtual)",
      "Seleccionás tu frecuencia (1, 2 o 3 veces por semana)",
      "Confirmás tu horario y te unís al grupo"
    ]
  },
  {
    title: "Primera Clase",
    description: "Te presentás al grupo, conocés la dinámica y empezás a moverte.",
    details: [
      "Presentación al grupo y al instructor",
      "Conocimiento de la estructura de la clase",
      "Primera práctica junto al grupo"
    ]
  },
  {
    title: "Práctica Regular",
    description: "Construís tu rutina de movimiento con el grupo, semana a semana.",
    details: [
      "Asistencia regular a las clases programadas",
      "Progresión junto al grupo",
      "Integración del movimiento en tu vida"
    ]
  },
  {
    title: "Evolución Grupal",
    description: "El grupo avanza junto, compartiendo desafíos y logros.",
    details: [
      "Desarrollo colectivo del movimiento",
      "Aprendizaje mutuo entre participantes",
      "Construcción de comunidad de práctica"
    ]
  }
];

const personalizedSteps = [
  {
    title: "Evaluación Inicial",
    description: "Necesito entender tu cuerpo, tus objetivos y tu momento actual.",
    details: [
      "Análisis de tu estructura corporal",
      "Evaluación de tus patrones de movimiento",
      "Identificación de objetivos y limitaciones",
      "Historial de práctica y experiencia"
    ]
  },
  {
    title: "Diseño de tu Programa",
    description: "Creo tu plan personalizado, pensado específicamente para ti.",
    details: [
      "Programa adaptado a tu cuerpo",
      "Progresión personal de movimiento",
      "Objetivos medibles y específicos",
      "Plan de seguimiento semanal"
    ]
  },
  {
    title: "Clase en Vivo Semanal",
    description: "Cada semana tenés tu clase diseñada para ti, con ajustes en tiempo real.",
    details: [
      "Clase 1 a 1 adaptada a tu proceso",
      "Correcciones personalizadas",
      "Ajustes según tu evolución",
      "Feedback directo en cada sesión"
    ]
  },
  {
    title: "Seguimiento Constante",
    description: "Reviso tu práctica, analizo tu progreso y ajusto tu plan constantemente.",
    details: [
      "Evaluación continua de tu evolución",
      "Modificaciones del programa según resultados",
      "Acompañamiento en cada paso",
      "Ajustes que responden a tu proceso"
    ]
  },
  {
    title: "Re-evaluación Periódica",
    description: "Cada cierto tiempo evaluamos tu progreso y rediseñamos tu camino.",
    details: [
      "Medición de cambios estructurales",
      "Análisis de mejoras en movimiento",
      "Actualización de objetivos",
      "Nuevo diseño de tu programa"
    ]
  },
  {
    title: "Formación Personal",
    description: "Te educo en los principios del movimiento que aplicás en tu práctica.",
    details: [
      "Educación en anatomía funcional",
      "Principios de movimiento humano",
      "Entendimiento de tu propio cuerpo",
      "Autonomía en tu práctica"
    ]
  }
];

const ClassProcess = ({ classType }: ClassProcessProps) => {
  const steps = classType === 'personalizado' ? personalizedSteps : commonSteps;
  const title = classType === 'personalizado'
    ? 'Hablemos de tu proceso...'
    : 'Hablemos del proceso grupal...';
  const description = classType === 'personalizado'
    ? 'Todo camino empieza en un punto. Tu proceso es único, por eso tu programa también lo es. Trazamos líneas entre nodos para que tu camino sea coherente con tu cuerpo y tus objetivos. Te acompaño en cada paso, presencialmente, porque creo que tu proceso personal merece atención dedicada en persona.'
    : 'El movimiento compartido tiene su propia magia. Cuando el grupo se encuentra en persona, la práctica se vuelve conversación entre cuerpos. Cada sesión presencial es un paso más en el camino colectivo. Creo que el grupo tiene algo que la práctica individual no tiene cuando estamos juntos físicamente, y quiero que lo experimentes.';

  return (
    <section className="py-20 bg-white font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-gray-500 mb-3">El proceso</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black">
            {title}
          </h2>
          <p className="text-base md:text-xl text-gray-600 font-light max-w-3xl leading-relaxed">
            {description}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="group bg-gray-50 border border-black/5 rounded-2xl p-6 md:p-8 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              {/* Icosahedron with Number */}
              <div className="mb-6">
                <div className="w-14 h-14 relative flex items-center justify-center flex-shrink-0 overflow-hidden opacity-60">
                  <img 
                    src={`/images/svg/icosahedro${(index % 6) + 1}.svg`}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Step Content */}
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-black">
                {step.title}
              </h3>
              <p className="text-sm md:text-base mb-4 leading-relaxed text-gray-700 font-light">
                {step.description}
              </p>

              {/* Step Details */}
              <div className="space-y-2">
                {step.details.map((detail, detailIndex) => (
                  <motion.div 
                    key={detailIndex} 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: (index * 0.08) + (detailIndex * 0.03) }}
                    viewport={{ once: true }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-black/30"></div>
                    <span className="text-xs md:text-sm leading-relaxed text-gray-600 font-light">
                      {detail}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="relative rounded-2xl p-12 md:p-16 overflow-hidden bg-gray-900 border border-black/10">
            {/* Imagen de fondo con overlay oscuro */}
            <CldImage
              src="my_uploads/plaza/DSC03350_vgjrrh"
              width={1200}
              height={600}
              alt="Clases fondo"
              className="absolute inset-0 w-full h-full object-cover object-center z-0"
              style={{ filter: 'brightness(0.2) grayscale(100%)' }}
            />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-white">
                ¿Te interesa {classType === 'personalizado' ? 'este proceso personalizado' : 'este proceso grupal'}?
              </h3>
              <p className="mb-8 max-w-2xl mx-auto text-white/90 font-light leading-relaxed text-base md:text-lg">
                Si esto que te conté te hace sentido, revisá los horarios disponibles y encontrá la opción que mejor se adapte a vos. No te quiero hacer perder el tiempo, si esto resuena contigo, seguimos. Si no, mejor que lo sepas ahora.
              </p>
              <button 
                onClick={() => {
                  const element = document.getElementById('class-schedules');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white text-black px-10 py-4 font-semibold text-base md:text-lg hover:bg-gray-100 transition-all duration-300 font-montserrat rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Ver horarios disponibles
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ClassProcess;

