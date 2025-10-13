import React from 'react';
import { UserGroupIcon, AcademicCapIcon, VideoCameraIcon, ChatBubbleLeftRightIcon, CheckCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

type Benefit = {
  icon: any;
  title: string;
  desc: string;
};

const benefits: Benefit[] = [
  {
    icon: UserGroupIcon,
    title: 'Acompañamiento 1:1',
    desc: 'Seguimiento personalizado y feedback directo.'
  },
  {
    icon: VideoCameraIcon,
    title: 'Correcciones en video',
    desc: 'Pasa tus prácticas y recibí feedback detallado.'
  },
  {
    icon: AcademicCapIcon,
    title: 'Formación teórica',
    desc: 'Aprende de tu fascia, biomoción y principios del movimiento.'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Llamadas 1:1',
    desc: 'Sesiones directas para profundizar, resolver dudas y ajustar tu plan.'
  },
  {
    icon: UserGroupIcon,
    title: 'Acceso a comunidad',
    desc: 'Forma parte de un grupo activo, compartí avances y recibí motivación.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Plan 100% personalizado',
    desc: 'Tu programa se adapta a tu cuerpo, objetivos y estilo de vida.'
  }
];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.08,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

const MentorshipIncludes = () => {
  return (
    <section className="py-20 pt-6 bg-white font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black">
            ¿Qué incluye la mentoría?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-light max-w-3xl leading-relaxed">
            Te acompaño desde el principio, primero con evaluaciones, luego encontramos la metodología perfecta para tu cuerpo, y vamos coocreando semana a semana, para que avances con claridad, seguridad y propósito.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((b, idx) => (
            <motion.div
              key={idx}
              className="group bg-gray-900/5 backdrop-blur-sm rounded-2xl p-8 hover:bg-gray-900/10 transition-all duration-300 flex flex-col items-start text-left border border-black/10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              custom={idx}
            >
              <div className="mb-6 p-3 rounded-full bg-black/5 group-hover:bg-black/10 transition-all duration-300">
                <b.icon className="w-8 h-8 text-black" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3 text-black">
                  {b.title}
                </h3>
                <p className="text-base md:text-lg text-gray-700 font-light leading-relaxed">
                  {b.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorshipIncludes; 