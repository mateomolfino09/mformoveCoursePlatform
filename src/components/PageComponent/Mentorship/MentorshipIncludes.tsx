import React from 'react';
import { motion } from 'framer-motion';
import { 
  PiHexagonThin, 
  PiCircleThin, 
  PiSquareThin, 
  PiTriangleThin,
  PiDiamondThin,
  PiOctagonThin
} from 'react-icons/pi';

type Benefit = {
  icon: any;
  title: string;
  subtitle: string;
  desc: string;
  items: string[];
  value: string;
};

const benefits: Benefit[] = [
  {
    icon: PiHexagonThin,
    title: 'Diagnóstico de alta precisión',
    subtitle: 'Tu caso es único, tu plan también.',
    desc: 'Ver lo que otros no ven, conectar puntos, dar prioridades.',
    items: [
      'Análisis de historia de movimiento y desequilibrios',
      'Revisión de videos iniciales + formulario de inmersión',
      'Matriz de prioridades con objetivos medibles'
    ],
    value: 'Sabés exactamente qué hacer, por qué y cómo impacta.'
  },
  {
    icon: PiCircleThin,
    title: 'Programación dinámica',
    subtitle: 'El proceso vivo que evoluciona con vos.',
    desc: 'Saber cuándo subir, bajar, integrar o ajustar sin romper.',
    items: [
      'Programación mensual o quincenal flexible',
      'Ajustes continuos según tu contexto y rendimiento',
      'Explicaciones del porqué para desarrollar criterio'
    ],
    value: 'Tu plan siempre está optimizado para tu momento actual.'
  },
  {
    icon: PiSquareThin,
    title: 'Acompañamiento técnico cercano',
    subtitle: 'Corregimos, cocreamos y evolucionamos juntos.',
    desc: 'Ojo técnico, criterio de progresión y capacidad pedagógica.',
    items: [
      'Revisión de videos 1–2 veces por semana',
      'Correcciones en audio/video/texto',
      'Chat privado con respuesta en 24h hábiles',
      'Llamada mensual para alinear objetivos'
    ],
    value: 'Superás mesetas con un experto vigilando cada detalle.'
  }
];

const exclusions = [
  'Soporte ilimitado 24/7 (protegemos tu foco y el mío)',
  'Sesiones en vivo semanales',
  'Programas genéricos'
];

const cardVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

const MentorshipIncludes = () => {
  return (
    <section className="relative py-20 pt-12 bg-black font-montserrat">
      <div className="max-w-6xl mx-auto px-6 relative">
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-gray-400 mb-3">Lo que incluye</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            ¿Qué incluye la mentoría?
          </h2>
          <p className="text-lg md:text-xl text-white/80 font-light max-w-3xl leading-relaxed">
          El movimiento es una forma de expresión de nuestra continuidad estructural. Entendemos nuestro cuerpo como un sistema integrado que se auto-emerge.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((b, idx) => (
            <motion.div
              key={idx}
              className="group bg-black backdrop-blur rounded-3xl p-8 hover:bg-black transition-all duration-300 flex flex-col items-start text-left border border-white/10 hover:border-[#AF50E5]/30 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_24px_48px_-12px_rgba(175,80,229,0.2)]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
            >
              <div className="mb-6 p-3 rounded-2xl bg-white/5 group-hover:bg-[#AF50E5]/10 transition-all duration-300 border border-[#AF50E5]/20">
                <b.icon className="w-10 h-10 text-[#AF50E5] group-hover:text-[#AF50E5] transition-colors duration-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-semibold mb-2 text-white min-h-[3rem] md:min-h-[3.5rem] flex items-start">
                  {b.title}
                </h3>
                <p className="text-sm md:text-base text-white/70 font-medium mb-4 italic min-h-[2.5rem] md:min-h-[3rem] flex items-start">
                  {b.subtitle}
                </p>
                <ul className="space-y-2 mb-4">
                  {b.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-[#AF50E5]" />
                      <span className="text-sm md:text-base text-white/80 font-light leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-[#AF50E5]/20">
                  <p className="text-sm md:text-base text-white/90 font-medium italic">
                    {b.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <div className="relative rounded-3xl overflow-hidden bg-black border border-white/10 shadow-[0_25px_60px_0_rgba(0,0,0,0.5)]">
            {/* Content */}
            <div className="relative p-8 md:p-10 lg:p-12 space-y-8">
              {/* Header */}
              <div className="space-y-3">
                <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-gray-400">
                  límites claros
                </p>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-white">
                  Lo que esta mentoría no incluye
                </h3>
                <p className="text-sm md:text-base text-white/70 font-light max-w-3xl leading-relaxed">
                  Tu inversión es en criterio técnico y acompañamiento personalizado. No pagás por tiempo, pagás por progresar.
                </p>
              </div>

              {/* Exclusions grid */}
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                {exclusions.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.1,
                      ease: 'easeOut' 
                    }}
                    viewport={{ once: true }}
                    className="group bg-black border border-white/10 rounded-2xl p-5 md:p-6 hover:border-[#AF50E5]/40 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#AF50E5]/20 border border-[#AF50E5]/40 flex items-center justify-center group-hover:bg-[#AF50E5]/30 group-hover:border-[#AF50E5] transition-all duration-300">
                        <span className="text-sm font-semibold text-[#AF50E5]">{index + 1}</span>
                      </div>
                      <span className="text-sm md:text-base text-white/80 font-light leading-relaxed flex-1">
                        {item}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer tagline */}
              <div className="pt-6 border-t border-[#AF50E5]/20">
                <p className="text-xs md:text-sm text-gray-400 uppercase tracking-[0.4em] font-medium">
                  claridad &gt; dispersión
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MentorshipIncludes; 