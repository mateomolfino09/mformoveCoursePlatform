'use client'
import React from 'react';
import { UserGroupIcon, AcademicCapIcon, VideoCameraIcon, ChartBarIcon, ClockIcon, UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface ClassIncludesProps {
  classType: 'comun' | 'personalizado';
}

type Benefit = {
  icon: any;
  title: string;
  desc: string;
};

const commonBenefits: Benefit[] = [
  {
    icon: UserGroupIcon,
    title: 'Movimiento grupal presencial',
    desc: 'Practica junto a otros en persona, comparte energía y aprende del grupo en nuestro espacio físico.'
  },
  {
    icon: ClockIcon,
    title: 'Horarios fijos',
    desc: 'Clases programadas con horarios regulares que podés incorporar a tu rutina.'
  },
  {
    icon: AcademicCapIcon,
    title: 'Estructura clara',
    desc: 'Cada clase tiene una estructura diseñada para el grupo, con progresión pensada.'
  },
  {
    icon: VideoCameraIcon,
    title: 'Clases presenciales',
    desc: 'Sesiones en persona donde el grupo se encuentra y practica junto en nuestro estudio.'
  },
  {
    icon: CheckCircleIcon,
    title: 'Consistencia',
    desc: 'Rutina regular de práctica que te permite construir hábitos de movimiento.'
  },
  {
    icon: ChartBarIcon,
    title: 'Progreso grupal',
    desc: 'Evolución junto al grupo, compartiendo logros y desafíos colectivos.'
  }
];

const personalizedBenefits: Benefit[] = [
  {
    icon: UserIcon,
    title: 'Programa personalizado',
    desc: 'Tu plan diseñado específicamente para tu cuerpo, objetivos y estilo de vida.'
  },
  {
    icon: VideoCameraIcon,
    title: 'Clase presencial semanal',
    desc: 'Una clase presencial cada semana diseñada para ti, con ajustes en tiempo real según tu práctica.'
  },
  {
    icon: ChartBarIcon,
    title: 'Seguimiento personal',
    desc: 'Acompañamiento 1 a 1 con revisión constante de tu progreso y ajustes del plan.'
  },
  {
    icon: AcademicCapIcon,
    title: 'Evaluación inicial',
    desc: 'Análisis de tu estructura corporal, patrones de movimiento y objetivos personales.'
  },
  {
    icon: CheckCircleIcon,
    title: 'Ajustes constantes',
    desc: 'Tu programa evoluciona según tu proceso, con modificaciones que responden a tu desarrollo.'
  },
  {
    icon: ClockIcon,
    title: 'Atención dedicada',
    desc: 'Espacio exclusivo para tu proceso, sin adaptaciones grupales ni compromisos.'
  }
];


const ClassIncludes = ({ classType }: ClassIncludesProps) => {
  const benefits = classType === 'personalizado' ? personalizedBenefits : commonBenefits;
  const title = classType === 'personalizado' 
    ? '¿Qué incluye la clase personalizada?'
    : '¿Qué incluyen las clases comunes?';
  const description = classType === 'personalizado'
    ? 'Te lo digo directo: esto no es una clase grupal adaptada. Es tu proceso, tu programa, tu movimiento presencial. Cada elemento lo pienso específicamente para tu cuerpo y tu evolución. Mi compromiso es contigo, en persona, no con un grupo.'
    : 'Movimiento compartido, energía colectiva. Cada clase presencial es un espacio donde el grupo se encuentra, donde la práctica se vuelve conversación entre cuerpos en nuestro estudio. Creo que el grupo tiene su propia magia cuando estamos juntos, y quiero que la experimentes.';

  return (
    <section className="py-20 bg-gray-50 font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-gray-500 mb-3">Lo que incluye</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black">
            {title}
          </h2>
          <p className="text-base md:text-xl text-gray-600 font-light max-w-3xl leading-relaxed">
            {description}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((b, idx) => (
            <motion.div
              key={idx}
              className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 p-3 w-12 h-12 rounded-full bg-black/5 flex items-center justify-center">
                <b.icon className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">
                {b.title}
              </h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed font-light flex-grow">
                {b.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClassIncludes;

