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
    desc: 'Seguimiento personalizado y feedback directo de Mateo en cada etapa.'
  },
  {
    icon: VideoCameraIcon,
    title: 'Feedback de videos',
    desc: 'Envía tus prácticas y recibe correcciones detalladas para avanzar seguro.'
  },
  {
    icon: AcademicCapIcon,
    title: 'Formación teórica',
    desc: 'Aprende anatomía funcional, biomecánica y principios del movimiento consciente.'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Llamadas 1:1',
    desc: 'Sesiones directas para profundizar, resolver dudas y ajustar tu plan.'
  },
  {
    icon: UserGroupIcon,
    title: 'Acceso a comunidad',
    desc: 'Forma parte de un grupo activo, comparte avances y recibe motivación.'
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
    <section className="py-16 bg-white font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center" style={{ color: 'black' }}>
          ¿Qué incluye la mentoría?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((b, idx) => (
            <motion.div
              key={idx}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform flex flex-col items-center text-center border border-gray-100 hover:border-[#234C8C]/20 relative overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              custom={idx}
              whileHover={{ scale: 1.015, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#234C8C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 mb-6 p-4 rounded-full bg-gradient-to-br from-[#234C8C]/10 to-[#5fa8e9]/10 group-hover:from-[#234C8C]/20 group-hover:to-[#5fa8e9]/20 transition-all duration-300">
                <b.icon className="w-12 h-12" style={{ color: 'rgb(35, 76, 140)' }} />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3 group-hover:text-[#234C8C] transition-colors duration-300" style={{ color: '#234C8C' }}>
                  {b.title}
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  {b.desc}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#234C8C]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorshipIncludes; 